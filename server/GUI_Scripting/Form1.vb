Imports System.Collections.ObjectModel
Imports System.Collections.Specialized.BitVector32
Imports System.Data.Common

Public Class Form1

    Public Sub MainDoer()
CheckDB:
        Dim dal As New DALControl
        Dim query As String = "SELECT * FROM SFM_RCH.Y_WEBAPP_SCRIPT_QUEUE WHERE ACCEPTED_DATE IS NULL ORDER BY REQUEST_DATE ASC"
        dal.RunQuery(query)
        Try
            For Each row As DataRow In dal.SQLDataset01.Tables(0).Rows
                Dim Transaction = row.Item(0)
                Dim Details = row.Item(1)
                Dim RequestDate = row.Item(2)
                Dim RequestIP = row.Item(6)
                Dim query2 = "UPDATE SFM_RCH.Y_WEBAPP_SCRIPT_QUEUE SET ACCEPTED_DATE = CURRENT_DATE, FULFILL_NAME = '" & Environment.MachineName & "' WHERE TRANSACTION = '" & Transaction & "' AND DETAILS = '" & Details & "' AND REQUEST_IP = '" & RequestIP & "' AND REQUEST_DATE = TO_DATE('" & RequestDate & "', 'MM/DD/YYYY HH:MI:SS AM')"
                Dim dal2 As New DALControl
                dal.RunQuery(query2)
                If Transaction = "LX02" Then
                    Dim fileDir = "C:\WebApp_NodeJS\server\GUI_Scripting\"
                    Dim fileName = Details & "_" & DateTime.Now.ToString("HH-mm-ss-ff") & ".xlsx"
                    RunLX02(Details, fileDir, fileName)
                    Dim query3 = "UPDATE SFM_RCH.Y_WEBAPP_SCRIPT_QUEUE SET FULFILLED_DATE = CURRENT_DATE, FILE_NAME = '" & fileDir & fileName & "' WHERE TRANSACTION = '" & Transaction & "' AND DETAILS = '" & Details & "' AND REQUEST_IP = '" & RequestIP & "' AND REQUEST_DATE = TO_DATE('" & RequestDate & "', 'MM/DD/YYYY HH:MI:SS AM')"
                    Dim dal3 As New DALControl
                    dal3.RunQuery(query3)
                Else
                    MsgBox("Invalid transaction")
                End If
            Next

            Threading.Thread.Sleep(250)
        Catch ex As Exception

        End Try


        GoTo CheckDB
    End Sub
    Public Sub RunLX02(Bin, fileDir, fileName)
        Label1.Text = "RUNNING"
        Dim script = "" &
        "If Not IsObject(application) Then" & vbNewLine &
        "   Set SapGuiAuto  = GetObject(""SAPGUI"")" & vbNewLine &
        "   Set application = SapGuiAuto.GetScriptingEngine" & vbNewLine &
        "End If" & vbNewLine &
        "If Not IsObject(connection) Then" & vbNewLine &
        "   Set connection = application.Children(0)" & vbNewLine &
        "End If" & vbNewLine &
        "If Not IsObject(session) Then" & vbNewLine &
        "   Set session    = connection.Children(0)" & vbNewLine &
        "End If" & vbNewLine &
        "If IsObject(WScript) Then" & vbNewLine &
         "   WScript.ConnectObject session, ""on""" & vbNewLine &
        "   WScript.ConnectObject Application, ""on""" & vbNewLine &
        "End If" & vbNewLine &
        "session.findById(""wnd[0]"").maximize" & vbNewLine &
        "session.findById(""wnd[0]/tbar[0]/okcd"").text = ""lx02""" & vbNewLine &
        "session.findById(""wnd[0]"").sendVKey 0" & vbNewLine &
        "session.findById(""wnd[0]/usr/ctxtS1_LGNUM"").text = ""800""" & vbNewLine &
        "session.findById(""wnd[0]/usr/ctxtS1_LGTYP-LOW"").text = ""310""" & vbNewLine &
        "session.findById(""wnd[0]/usr/ctxtS1_LGPLA-LOW"").text = """ & Bin & """" & vbNewLine &'The Bin goes here
        "session.findById(""wnd[0]/usr/ctxtS1_LGPLA-HIGH"").text = """ & Bin & """" & vbNewLine &'The Bin goes here
        "session.findById(""wnd[0]/usr/ctxtWERKS-LOW"").text = ""G300""" & vbNewLine &
        "session.findById(""wnd[0]/usr/ctxtP_VARI"").text = ""/ETHAN""" & vbNewLine &
        "session.findById(""wnd[0]/usr/ctxtP_VARI"").setFocus" & vbNewLine &
        "session.findById(""wnd[0]/usr/ctxtP_VARI"").caretPosition = 6" & vbNewLine &
        "session.findById(""wnd[0]/tbar[1]/btn[8]"").press" & vbNewLine &
        "session.findById(""wnd[0]/tbar[1]/btn[16]"").press" & vbNewLine &
        "session.findById(""wnd[1]/tbar[0]/btn[0]"").press" & vbNewLine &
        "session.findById(""wnd[1]/usr/ctxtDY_PATH"").text = """ & fileDir & """" & vbNewLine &'The file location goes here
        "session.findById(""wnd[1]/usr/ctxtDY_FILENAME"").text = """ & fileName & """" & vbNewLine & 'The file name goes here
        "session.findById(""wnd[1]/usr/ctxtDY_PATH"").setFocus" & vbNewLine &
        "session.findById(""wnd[1]/usr/ctxtDY_PATH"").caretPosition = 42" & vbNewLine &
        "session.findById(""wnd[1]/tbar[0]/btn[11]"").press" & vbNewLine &
        "session.findById(""wnd[0]/tbar[0]/btn[3]"").press" & vbNewLine &
        "session.findById(""wnd[0]/tbar[0]/btn[3]"").press"

        Using sw As New IO.StreamWriter("C:\WebApp_NodeJS\server\GUI_Scripting\LX02_Script.vbs", False)
            sw.Write(script)
        End Using

        Dim proc = System.Diagnostics.Process.Start("C:\Windows\system32\cscript.exe", "C:\WebApp_NodeJS\server\GUI_Scripting\LX02_Script.vbs")

        'Wait until the process is Finished
        While proc.HasExited = False
            Threading.Thread.Sleep(250)
        End While

        Label1.Text = "IDLE"
    End Sub

    Private Sub Form1_Load(sender As Object, e As EventArgs) Handles MyBase.Shown
        BackgroundWorker1.RunWorkerAsync()
    End Sub

    Private Sub BackgroundWorker1_DoWork(sender As Object, e As System.ComponentModel.DoWorkEventArgs) Handles BackgroundWorker1.DoWork
        CheckForIllegalCrossThreadCalls = False
        MainDoer()
    End Sub
End Class
