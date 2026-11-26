import { USER_ROLES } from '../../constants/roleConstants'

// Roles the store-payments list API serves; they see the Store Requests tab.
export const STORE_REQUEST_ROLES = [
  USER_ROLES.SUPER_ADMIN,
  USER_ROLES.COMPANY_ADMIN,
  USER_ROLES.STORE_ADMIN,
  USER_ROLES.MANAGER,
  USER_ROLES.ACCOUNTS_USER,
  'Admin',
]
