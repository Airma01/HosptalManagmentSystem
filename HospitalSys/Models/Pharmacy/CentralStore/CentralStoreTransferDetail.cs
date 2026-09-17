
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using HospitalSys.Models.Pharmacy.Common;

namespace HospitalSys.Models.Pharmacy.CentralStore
{
  public class CentralStoreTransferDetail
        {
            public int CentralTransferDetailID { get; set; }

            public int CentralTransferID { get; set; }
            [ForeignKey(nameof(CentralTransferID))]
            public CentralStoreTransfer? CentralStoreTransfer { get; set; }

            public int CentralInventoryID { get; set; }
            [ForeignKey(nameof(CentralInventoryID))]
            public CentralStoreInventory? CentralStoreInventory { get; set; }

            public int QuantityTransferred { get; set; }
        }
}
