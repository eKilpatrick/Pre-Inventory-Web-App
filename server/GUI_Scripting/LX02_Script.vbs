If Not IsObject(application) Then
   Set SapGuiAuto  = GetObject("SAPGUI")
   Set application = SapGuiAuto.GetScriptingEngine
End If
If Not IsObject(connection) Then
   Set connection = application.Children(0)
End If
If Not IsObject(session) Then
   Set session    = connection.Children(0)
End If
If IsObject(WScript) Then
   WScript.ConnectObject session, "on"
   WScript.ConnectObject Application, "on"
End If
session.findById("wnd[0]").maximize
session.findById("wnd[0]/tbar[0]/okcd").text = "lx02"
session.findById("wnd[0]").sendVKey 0
session.findById("wnd[0]/usr/ctxtS1_LGNUM").text = "800"
session.findById("wnd[0]/usr/ctxtS1_LGTYP-LOW").text = "310"
session.findById("wnd[0]/usr/ctxtS1_LGPLA-LOW").text = "01A01"
session.findById("wnd[0]/usr/ctxtS1_LGPLA-HIGH").text = "01A01"
session.findById("wnd[0]/usr/ctxtWERKS-LOW").text = "G300"
session.findById("wnd[0]/usr/ctxtP_VARI").text = "/ETHAN"
session.findById("wnd[0]/usr/ctxtP_VARI").setFocus
session.findById("wnd[0]/usr/ctxtP_VARI").caretPosition = 6
session.findById("wnd[0]/tbar[1]/btn[8]").press
session.findById("wnd[0]/tbar[1]/btn[16]").press
session.findById("wnd[1]/tbar[0]/btn[0]").press
session.findById("wnd[1]/usr/ctxtDY_PATH").text = "C:\WebApp_NodeJS\server\GUI_Scripting\"
session.findById("wnd[1]/usr/ctxtDY_FILENAME").text = "01A01_15-13-01-35.xlsx"
session.findById("wnd[1]/usr/ctxtDY_PATH").setFocus
session.findById("wnd[1]/usr/ctxtDY_PATH").caretPosition = 42
session.findById("wnd[1]/tbar[0]/btn[11]").press
session.findById("wnd[0]/tbar[0]/btn[3]").press
session.findById("wnd[0]/tbar[0]/btn[3]").press