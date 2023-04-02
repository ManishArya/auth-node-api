export default interface Role {
  _id: string;
  name: string;
  perms: RolePermission[];
}

interface RolePermission {
  _id: string;
  value: number;
}
