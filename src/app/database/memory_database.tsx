import {lojas, usuarios, recibos, companies, sectors} from "@/app/lib/mokdata";
import { Company, Loja, Recibos, Sector, Users } from "../types";

export class MemoryDatabase {
    private static instance: MemoryDatabase;
    private users: Users[] = usuarios;
    private stores: Loja[] = lojas;
    private receipts: Recibos[] = recibos;
    private companies: Company[] = companies;
    private sectors: Sector[] = sectors;
    
    private constructor() {}
    
    public static getInstance(): MemoryDatabase {
        if (!MemoryDatabase.instance) {
        MemoryDatabase.instance = new MemoryDatabase();
        }
        return MemoryDatabase.instance;
    }

    getUsers(): Users[] {
        return this.users;
    }
    getStores(): Loja[] {
        return this.stores;
    }
    getReceipts(): Recibos[] {      
        return this.receipts;
    }
    getCompanies(): Company[] {
        return this.companies;
    }
    getSectors(): Sector[] {
        return this.sectors;
    }
    addUser(user: Users): void {
        this.users.push(user);
    }
    
    addStore(store: Loja): void {
        this.stores.push(store);
    }
    addReceipt(receipt: Recibos): void {
        this.receipts.push(receipt);
    }
    addCompany(company: Company): void {    
        this.companies.push(company);
    }
    addSector(sector: Sector): void {
        this.sectors.push(sector);
    }   
    updateUser(id: string, updatedUser: Partial<Users>): void {
        const userIndex = this.users.findIndex(user => user.id === id);
        if (userIndex !== -1) {
            this.users[userIndex] = { ...this.users[userIndex], ...updatedUser };
        }
    }
    updateStore(id: string, updatedStore: Partial<Loja>): void {
        const storeIndex = this.stores.findIndex(store => store.id === id);
        if (storeIndex !== -1) {
            this.stores[storeIndex] = { ...this.stores[storeIndex], ...updatedStore };
        }
    }
    updateReceipt(id: string, updatedReceipt: Partial<Recibos>): void {
        const receiptIndex = this.receipts.findIndex(receipt => receipt.id === id);
        if (receiptIndex !== -1) {
            this.receipts[receiptIndex] = { ...this.receipts[receiptIndex], ...updatedReceipt };
        }
    }
    updateCompany(id: string, updatedCompany: Partial<Company>): void {   
        const companyIndex = this.companies.findIndex(company => company.id === id);
        if (companyIndex !== -1) {
            this.companies[companyIndex] = { ...this.companies[companyIndex], ...updatedCompany };
        }
    }       
    updateSector(id: string, updatedSector: Partial<Sector>): void {
        const sectorIndex = this.sectors.findIndex(sector => sector.id === id);
        if (sectorIndex !== -1) {
            this.sectors[sectorIndex] = { ...this.sectors[sectorIndex], ...updatedSector };
        }
    }
    deleteUser(id: string): void {
        this.users = this.users.filter(user => user.id !== id);
    }
    deleteStore(id: string): void {
        this.stores = this.stores.filter(store => store.id !== id);
    }
    deleteReceipt(id: string): void {
        this.receipts = this.receipts.filter(receipt => receipt.id !== id);
    }
    deleteCompany(id: string): void {
        this.companies = this.companies.filter(company => company.id !== id);
    }
    deleteSector(id: string): void {
        this.sectors = this.sectors.filter(sector => sector.id !== id);
    }
    findUserByEmail(email: string): Users | undefined {
        return this.users.find(user => user.email === email);
    }
    findStoreById(id: string): Loja | undefined {
        return this.stores.find(store => store.id === id);
    }
    findReceiptById(id: string): Recibos | undefined {
        return this.receipts.find(receipt => receipt.id === id);
    }
    findCompanyById(id: string): Company | undefined {
        return this.companies.find(company => company.id === id);
    }
    findSectorById(id: string): Sector | undefined {
        return this.sectors.find(sector => sector.id === id);
    }
    findUserById(id: string): Users | undefined {
        return this.users.find(user => user.id === id);
    }
    findStoreByCompanyId(companyId: string): Loja[] {
        return this.stores.filter(store => store.companyId === companyId);
    }

    findSectorByStoreId(storeId: string): Sector[] {
        const store = this.stores.find(store => store.id === storeId);
        return store ? store.sectors : [];
    }
    findSectorByCompanyId(companyId: string): Sector[] {
        return this.sectors.filter(sector => sector.id === companyId);
    }
    findReceiptByStoreId(storeId: string): Recibos[] {
        return this.receipts.filter(receipt => receipt.lojaId === storeId);
    }
    findReceiptByCompanyId(companyId: string): Recibos[] {
        // Assuming each receipt has a lojaId, and each store (Loja) has a companyId
        return this.receipts.filter(receipt => {
            const store = this.stores.find(store => store.id === receipt.lojaId);
            return store?.companyId === companyId;
        });
    }
    findReceiptBySectorId(sectorId: string): Recibos[] {
        return this.receipts.filter(receipt => receipt.setor === sectorId);
    }
    findReceiptByUserId(userId: string): Recibos[] {
        return this.receipts.filter(receipt => receipt.userId === userId);
    }
    findStoreBySectorId(sectorId: string): Loja[] {
        return this.stores.filter(store => store.sectors.some(sector => sector.id === sectorId));
    }
    findStoreByUserId(userId: string): Loja | undefined {
        const user = this.users.find(user => user.id === userId);
        return user ? this.stores.find(store => store.id === user.name) : undefined;
    }
    findCompanyByStoreId(storeId: string): Company | undefined {
        const store = this.stores.find(store => store.id === storeId);
        return store ? this.companies.find(company => company.id === store.companyId) : undefined;
    }
    findCompanyBySectorId(sectorId: string): Company | undefined {
        const sector = this.sectors.find(sector => sector.id === sectorId);
        return sector ? this.companies.find(company => company.id === sector.id) : undefined;
        
}
}