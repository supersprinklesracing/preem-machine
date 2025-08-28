import { ServiceAccount } from 'firebase-admin';

export interface ServiceAccountSecret {
  type: 'service_account';
  project_id: string;
  private_key_id: string;
  private_key: string;
  client_email: string;
  client_id: string;
  auth_uri: string;
  token_uri: string;
  auth_provider_x509_cert_url: string;
  client_x509_cert_url: string;
  universe_domain: string;
}

export function isServiceAccountSecret(
  value: unknown,
): value is ServiceAccountSecret {
  if (typeof value !== 'object' || value === null) {
    return false;
  }

  const obj = value as Record<string, unknown>;

  return (
    obj.type === 'service_account' &&
    typeof obj.project_id === 'string' &&
    typeof obj.private_key_id === 'string' &&
    typeof obj.private_key === 'string' &&
    typeof obj.client_email === 'string' &&
    typeof obj.client_id === 'string' &&
    typeof obj.auth_uri === 'string' &&
    typeof obj.token_uri === 'string' &&
    typeof obj.auth_provider_x509_cert_url === 'string' &&
    typeof obj.client_x509_cert_url === 'string' &&
    typeof obj.universe_domain === 'string'
  );
}

export function isServiceAccount(
  value: unknown,
): value is Required<ServiceAccount> {
  if (typeof value !== 'object' || value === null) {
    return false;
  }

  const obj = value as Record<string, unknown>;

  return (
    typeof obj.projectId === 'string' &&
    obj.projectId.length > 0 &&
    typeof obj.privateKey === 'string' &&
    obj.privateKey.length > 0 &&
    typeof obj.clientEmail === 'string' &&
    obj.clientEmail.length > 0
  );
}
