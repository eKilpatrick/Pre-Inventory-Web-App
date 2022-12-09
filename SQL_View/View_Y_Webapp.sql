select BlueSheet.bin, BlueSheet.partnumber, BlueSheet.actual_quantity, BlueSheet.sap_quantity, BlueSheet.transaction_date as Last_Movement_Date
from sfm_rch.y_webapp_bluesheet BlueSheet
inner join
(select bin, partnumber, MAX(transaction_date) as transaction_date from sfm_rch.y_webapp_bluesheet group by bin, partnumber) groupedBlueSheet
on BlueSheet.bin = groupedBlueSheet.bin
and BlueSheet.partnumber = groupedbluesheet.partnumber
and bluesheet.transaction_date = groupedbluesheet.transaction_date

UNION

(
	select bin, partnumber, actual_quantity, sap_quantity, uploaded_date
	from sfm_rch.y_webapp_orangesheet
	where not exists
	(
		select bin, partnumber
		from sfm_rch.y_webapp_bluesheet
		where sfm_rch.y_webapp_orangesheet.bin = sfm_rch.y_webapp_bluesheet.bin and
		sfm_rch.y_webapp_orangesheet.partnumber = sfm_rch.y_webapp_bluesheet.partnumber
	)
)