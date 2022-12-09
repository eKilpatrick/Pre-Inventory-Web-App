# Pre-Inventory-Web-App
Web application written to be used on handheld scanners in order to more effeciently take count of physical inventory once a year.

Overview
--------
  Counting inventory and taking note on paper is a huge hassle for the Siemens Energy plant I worked at in Richland, MS. I created this application in hopes of somewhat digitalizing the process and taking the load off of the inventory analysts. Its purpose is to get a physical count of all parts and their locations and compare that data with our active count in SAP before the official corporate inventory deadline. The stack used to create this project was React on the front-end, Node.js/Express on the back-end along with an Oracle database and SAP gui scripting. The project is still in development and requires more testing and error handling before it is production ready. The next step is to get access to the SAP Hana database. 
  
***Inspiration on the structure of the project was found in PedroTech's full stack web development series on YouTube (link below)
https://www.youtube.com/@PedroTechnologies

General Flow of the Project
---------------------------
1. User scans the bin they want to count (all inventory is stored in bins).
2. The data for that bin is pulled from SAP using the GUI script.
3. The user counts the parts in that bin. 
4. The user's count and SAP's count are then stored in the Oracle database.
5. After a bin is counted, users can then add or take away parts as they are taken to or received from the production floor.
6. During a transaction, the user scans the bin they want to take/put a part.
7. The current count of parts for that bin is pulled from the Oracle database.
8. The user chooses the part necessary and then enters in the amount they are taking/putting away.
9. The count for that part is pulled from SAP at this time and then compared with the active count in the Oracle database.
10. If they are different, the user is prompted to recount the parts in that bin.

Program Design
--------------
The server code is contained in the server folder. The server is created using node.js and express on port 3001. All of the GET, PUT and POST requests are detailed in the routes folder. The GUI Scripting folder contains the vbscript file that gets the part data from SAP. When any data from SAP needs to be pulled, the server sends a request to the database and a vb program edits the vbscript for the necessary bin and runs the script, then inputs the data to the database for the server to read. The Oracle.js file in the module_dev folder uses the oracledb npm package to query the local Oracle database.

The client code is contained in the client folder. The react development server is hosted on port 3000. The separate pages are all found in the pages folder. The client html is fairly simple as it is only a few buttons, text boxes and popups. All that is needed on the client side is ability to count or transact and then to specify parts and quantities, so it ins't very complex. The data handling on this project is the more difficult aspect.

There is sql embedded in all of the server code to query the database, but the more complex sql used for the view in the Oracle database is in the SQL_View folder. The database is configured as follows:
  1. Y_Webapp_Bins has a list of all bins and contains data on the state in which each bin is in (i.e. Counted/Counting/Neither)
  2. Y_Webapp_Activebin contains data on which bin each ip address that has connected to the server has dealt with last.
  3. Y_Webapp_Orangesheet contains the counts of parts in each bin and their counts in SAP.
  4. Y_Webapp_Bluesheet contains all transactions on any bins that have been counted.
  5. Y_Webapp_Script_Queue is a queue for all GUI scripts that need to be run.
  6. View_Y_Webapp contains the latest data on each unique PN/Bin combination found in either the orangesheet or bluesheet tables.

The vbproj that reads the script queue and runs the vbscript is included in the GUI_Sripting folder (only Form1.vb is included as the whole solution isn't necessary).

**The notation 'orangesheet' or 'bluesheet' comes from the manual process for counting that was in use prior to this program's inception. Orange sheets were used to write down the counts of parts and their corresponding counts in SAP along with if they were different how much they needed to be adjusted in the SAP system. Blue sheets were used for every transaction on a bin that has already been counted.

My tenure at Siemens Energy as a co-op ended during this project so this is the last point I was at when my term ended. This repository contains all of my contributions which mainly consist of the foundation of the project in its early stages. The software developers here will take it over and get it ready for use by the next inventory count. This is the first full stack web development project I've taken part in and it has been such a learning experience. I am always up for a new challenge and that's exactly what this proved to be. Hopefully the team at Siemens Energy in Richland, MS will be able to complete the project and put it to good use.
