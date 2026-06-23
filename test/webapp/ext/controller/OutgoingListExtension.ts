import ExtensionAPI from 'sap/fe/core/ExtensionAPI';
import Context from 'sap/ui/model/odata/v4/Context';
import MessageToast from 'sap/m/MessageToast';
import ODataModel from "sap/ui/model/odata/v4/ODataModel";
import MessageBox from 'sap/m/MessageBox';
import Fragment from "sap/ui/core/Fragment";
import Dialog from "sap/m/Dialog";
import JSONModel from "sap/ui/model/json/JSONModel";
import ResourceModel from "sap/ui/model/resource/ResourceModel";
import BusyIndicator from "sap/ui/core/BusyIndicator";
/**
* Generated event handler.
*
* @param this reference to the 'this' that the event handler is bound to.
* @param context the context of the page on which the event was fired. `undefined` for list report page.
* @param selectedContexts the selected contexts of the table rows.
*/

let _oDialog: Dialog;
export async function onSendAction(this: ExtensionAPI, context: Context | undefined, selectedContexts: Context[]) {
    console.log("Send triggered");

    if (!selectedContexts || selectedContexts.length === 0) {
        MessageToast.show("Lütfen bir satır seçin.");
        return;
    }

    const aMessages: { id: string; message: string; severity: number }[] = [];

    const oModel = (this as any).getModel() as ODataModel;

    BusyIndicator.show(0);
    for (const ctx of selectedContexts) {

        const sId = ctx.getProperty("Id") as string;

        const oBindingContext = oModel.bindContext(
            `${ctx.getPath()}/com.sap.gateway.srvd.aktek.es_ui_outgoing.v0001.send(...)`
        );

        try {
            await oBindingContext.invoke();
            const oBoundContext = oBindingContext.getBoundContext();
            const oData = oBoundContext.getObject() as any;
            oData.SAP__Messages.forEach((msg: any) => {
                aMessages.push({
                    id: sId,
                    message: msg.message,
                    severity: msg.numericSeverity
                });
            });
        } catch (oError: any) {
            aMessages.push({ id: sId, message: oError.message || "Bilinmeyen hata", severity: 4 });
        }


        const oResultModel = new JSONModel({ messages: aMessages });

        const oI18nModel = new ResourceModel({
            bundleName: "com.aktek.test.i18n.i18n",
            supportedLocales: ["en", "tr", ""],
            fallbackLocale: "en"
        });


        BusyIndicator.hide();
        if (!_oDialog) {
            _oDialog = (await Fragment.load({
                name: "com.aktek.test.ext.fragment.SendResultDialog",
                controller: { onCloseResultDialog: () => { _oDialog.close(); } }
            })) as Dialog;
        }

        _oDialog.setModel(oResultModel, "results");
        _oDialog.open();
        _oDialog.setModel(oI18nModel, "i18n");

        for (const ctx of selectedContexts) {
            ctx.refresh();
        }
        if (aMessages.length > 1) {

        } else {
            // MessageBox.()
        }





    }
}


