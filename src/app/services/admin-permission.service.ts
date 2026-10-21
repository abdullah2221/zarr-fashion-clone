import { Injectable, inject } from '@angular/core';
import { SupabaseAdminRepository, SupabaseCategoryRepository, SupabaseProductRepository, SupabaseProfileRepository } from '../data-access/supabase/supabase.repositories';

@Injectable({ providedIn: 'root' })
export class AdminPermissionService {
  private readonly productRepository = inject(SupabaseProductRepository);
  private readonly categoryRepository = inject(SupabaseCategoryRepository);
  private readonly adminRepository = inject(SupabaseAdminRepository);
  private readonly profileRepository = inject(SupabaseProfileRepository);

  async testProductRead() {
    const products = await this.productRepository.listActive();
    return `Read succeeded. ${products.length} active products visible to this session.`;
  }

  async testProductWrite() {
    const stamp = Date.now();
    const created = await this.productRepository.create({
      legacy_id: -(stamp % 2147483000),
      sku: `ADMIN-PROBE-${stamp}`,
      name: `Admin Probe Product ${stamp}`,
      slug: `admin-probe-product-${stamp}`,
      price: 1,
      is_active: false,
      stock_quantity: 0,
      metadata: { probe: true, createdAt: stamp },
    });
    await this.productRepository.delete(created.id);
    return 'Write succeeded. Temporary product insert/delete completed under current session.';
  }

  async testCategoryWrite() {
    const stamp = Date.now();
    const created = await this.categoryRepository.create({
      name: `Admin Probe Category ${stamp}`,
      slug: `admin-probe-category-${stamp}`,
      is_active: false,
      sort_order: 9999,
      description: 'Temporary permission probe category.',
    });
    await this.categoryRepository.delete(created.id);
    return 'Write succeeded. Temporary category insert/delete completed under current session.';
  }

  async testAdminSettingsRead() {
    const settings = await this.adminRepository.listSettings();
    return `Read succeeded. ${settings.length} admin settings rows visible to this session.`;
  }

  async testAdminSettingsWrite() {
    const key = `permission_probe_${Date.now()}`;
    await this.adminRepository.upsertSetting({
      key,
      value: { probe: true, createdAt: new Date().toISOString() },
    });
    await this.adminRepository.deleteSetting(key);
    return 'Write succeeded. Temporary admin_settings insert/delete completed under current session.';
  }

  async testProfileRoleUpdatePolicy() {
    const canManageRoles = await this.profileRepository.isSuperAdmin();
    return canManageRoles
      ? 'Allowed by live policy helper `is_super_admin()`. No unsafe role mutation was performed.'
      : 'Denied by live policy helper `is_super_admin()`. This session should not be able to manage roles.';
  }
}
