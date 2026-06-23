import ControllerExtension from "sap/ui/core/mvc/ControllerExtension";
import JSONModel from "sap/ui/model/json/JSONModel";
import Event from "sap/ui/base/Event";
import Table from "sap/m/Table";

export default class ListReporExt extends ControllerExtension {
  static override readonly overrides = {
    onInit(this: ListReporExt) {
    
      const oButtonStateModel = new JSONModel({
        sendEnabled: false
      });

      (this as any).getView().setModel(oButtonStateModel, "buttonState");
    },

    routing: {
      onAfterBinding(this: ListReporExt) {
        setTimeout(() => {
          const oTable = _findTable(this);

          if (oTable) {
            oTable.attachSelectionChange((oEvent: Event) => {
              _updateSendButton(this, oTable);
            });

            // İlk yüklemede de kontrol et
            _updateSendButton(this, oTable);
          }
        }, 500);
      }
    }
  };
}

function _findTable(ctrl: any): Table | null {
  const oView = ctrl.getView();

  const aTables = oView.findAggregatedObjects(
    true,
    (o: any) => o.isA("sap.m.Table")
  );

  return aTables.length > 0 ? (aTables[0] as Table) : null;
}

function _updateSendButton(ctrl: any, oTable: Table): void {
  const oModel = ctrl.getView().getModel("buttonState") as JSONModel;

  const aSelectedItems = oTable.getSelectedItems();

  // Hiç seçim yok
  if (aSelectedItems.length === 0) {
    oModel.setProperty("/sendEnabled", false);
    return;
  }

  // Tek seçim
  if (aSelectedItems.length === 1) {
    const oCtx = aSelectedItems[0].getBindingContext();

    if (!oCtx) {
      oModel.setProperty("/sendEnabled", false);
      return;
    }

    const iStep = Number(oCtx.getProperty("Step"));

    // Step = 4 ise disable
    oModel.setProperty("/sendEnabled", iStep !== 3);
    return;
  }

  // Çoklu seçim
  const bHasStep3 = aSelectedItems.some((oItem: any) => {
    const oCtx = oItem.getBindingContext();

    if (!oCtx) {
      return false;
    }

    return Number(oCtx.getProperty("Step")) === 2;
  });

  // En az bir Step=3 varsa enable
  oModel.setProperty("/sendEnabled", bHasStep3);
}