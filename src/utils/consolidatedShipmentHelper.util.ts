// Filter stores dengan stok
const getStoresWithStock = (stores: any[], productId: string): any[] => {
  return stores.filter((s: any) => {
    const stock = s.stocks?.find((st: any) => st.productId === productId);
    return stock && stock.quantity > 0;
  });
};

// Calculate total stock across stores
const calculateTotalStock = (storesWithStock: any[], productId: string): number => {
  return storesWithStock.reduce((sum: number, s: any) => {
    const stock = s.stocks.find((st: any) => st.productId === productId);
    return sum + (stock?.quantity || 0);
  }, 0);
};

// Find source store dengan stock terbanyak
const findSourceStore = (
  storesWithStock: any[],
  productId: string,
  nearestStore: any,
): any => {
  let sourceStore = nearestStore;
  let maxQty = nearestStore.stocks?.find(
    (s: any) => s.productId === productId,
  )?.quantity || 0;

  for (const store of storesWithStock.slice(1)) {
    const storeQty = store.stocks.find(
      (s: any) => s.productId === productId,
    )?.quantity;
    if (storeQty && storeQty > maxQty) {
      sourceStore = store;
      maxQty = storeQty;
    }
  }
  return sourceStore;
};

// Create mutation request
const createMutationRequest = async (
  sourceStore: any,
  nearestStore: any,
  item: any,
  needed: number,
  tx: any,
): Promise<void> => {
  await tx.mutation.create({
    data: {
      productId: item.productId,
      fromStoreId: sourceStore.storeId,
      toStoreId: nearestStore.storeId,
      quantity: needed,
      mutationStatus: "PENDING",
    },
  });
};

// Check if Consolidated Shipment mutation needed
export const checkAndCreateMutationIfNeeded = async (
  stores: any[],
  item: any,
  tx: any,
): Promise<boolean> => {
  const storesWithStock = getStoresWithStock(stores, item.productId);
  const totalStock = calculateTotalStock(storesWithStock, item.productId);

  if (totalStock < item.quantity) return false;

  const nearestStore = stores[0];
  const nearestQty =
    nearestStore.stocks?.find((s: any) => s.productId === item.productId)
      ?.quantity || 0;

  if (nearestQty < item.quantity) {
    const sourceStore = findSourceStore(storesWithStock, item.productId, nearestStore);
    const needed = item.quantity - nearestQty;
    await createMutationRequest(sourceStore, nearestStore, item, needed, tx);
  }

  return true;
};
