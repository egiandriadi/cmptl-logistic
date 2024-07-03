export default interface JneLocationRepositoryInterface {
    getByZipCode(zipCode: string | null): Promise<any>;
}