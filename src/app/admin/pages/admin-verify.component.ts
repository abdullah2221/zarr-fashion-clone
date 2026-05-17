import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { AdminPermissionService } from '../../services/admin-permission.service';
import { AdminSessionService } from '../../services/admin-session.service';
import { PermissionProbeState } from '../../shared/models/auth.models';
import { AdminActionButtonComponent } from '../components/admin-action-button.component';

type ProbeKey =
  | 'productRead'
  | 'productWrite'
  | 'categoryWrite'
  | 'settingsRead'
  | 'settingsWrite'
  | 'profileRoleUpdate';

@Component({
  selector: 'app-admin-verify',
  standalone: true,
  imports: [CommonModule, MatIconModule, AdminActionButtonComponent],
  templateUrl: './admin-verify.component.html',
  styleUrl: './admin-verify.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminVerifyComponent {
  readonly session = inject(AdminSessionService);
  private readonly permissionService = inject(AdminPermissionService);

  readonly results = signal<Record<ProbeKey, PermissionProbeState>>({
    productRead: { status: 'idle', message: 'Ready to probe product read access.' },
    productWrite: { status: 'idle', message: 'Ready to probe product write access.' },
    categoryWrite: { status: 'idle', message: 'Ready to probe category write access.' },
    settingsRead: { status: 'idle', message: 'Ready to probe admin_settings read access.' },
    settingsWrite: { status: 'idle', message: 'Ready to probe admin_settings write access.' },
    profileRoleUpdate: { status: 'idle', message: 'Ready to probe role-management policy.' },
  });

  async runProbe(key: ProbeKey) {
    this.patchResult(key, { status: 'running', message: 'Running live permission probe...' });

    try {
      const message = await this.executeProbe(key);
      this.patchResult(key, { status: 'success', message });
    } catch (error) {
      this.patchResult(key, {
        status: 'error',
        message: error instanceof Error ? error.message : 'Permission probe failed.',
      });
    }
  }

  private executeProbe(key: ProbeKey) {
    switch (key) {
      case 'productRead':
        return this.permissionService.testProductRead();
      case 'productWrite':
        return this.permissionService.testProductWrite();
      case 'categoryWrite':
        return this.permissionService.testCategoryWrite();
      case 'settingsRead':
        return this.permissionService.testAdminSettingsRead();
      case 'settingsWrite':
        return this.permissionService.testAdminSettingsWrite();
      case 'profileRoleUpdate':
        return this.permissionService.testProfileRoleUpdatePolicy();
    }
  }

  private patchResult(key: ProbeKey, result: PermissionProbeState) {
    this.results.update(current => ({ ...current, [key]: result }));
  }
}
