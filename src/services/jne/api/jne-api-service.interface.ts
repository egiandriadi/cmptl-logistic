export default interface JneApiServiceInterface {
    checkTariff(checkTariffDto : any) : Promise<any>
    createOrder(createOrderDto : any) : Promise<any>
    cancelOrder(cancelOrderDto : any) : Promise<any>
}