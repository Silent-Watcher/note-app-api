/**
 * Interface defining the admin service methods.
 */
export interface IAdminService {
	serviceName: string;
}

const createAdminService = () => ({
	serviceName: 'admin',
});

/**
 * Singleton instance of the admin service.
 */
export const adminService = createAdminService();
