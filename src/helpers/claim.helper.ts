import db from '../databases/prisma'

export const calculateAmountClaim = async (type: string, order: any) => {
  if (!type || !order) return

  let amountClaim

  const paymentMethod = await db.m_metode_pembayaran.findFirst({ where: { id: order?.metode_pembayaran_id } })

  if (type === 'HARGA') {
    if (paymentMethod?.name === 'COD') amountClaim = order.nilai_cod - order.tarif
    if (paymentMethod?.name === 'NON COD') amountClaim = order.nilai_barang - order.tarif
  }
  else if (type === 'ONGKOS') amountClaim = order.tarif

  return amountClaim
}
