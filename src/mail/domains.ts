/**
 * Domains client for Stack0 Mail API
 */

import type { HttpClient } from "../lib/http-client";
import type {
  AddDomainRequest,
  AddDomainResponse,
  DeleteDomainResponse,
  Domain,
  GetDnsRecordsResponse,
  ListDomainsRequest,
  ListDomainsResponse,
  SetDefaultDomainResponse,
  VerifyDomainResponse,
} from "./types";

export class Domains {
  constructor(private http: HttpClient) {}

  /**
   * List all domains for the organization
   */
  async list(request: ListDomainsRequest): Promise<ListDomainsResponse> {
    const params = new URLSearchParams();
    params.set("projectSlug", request.projectSlug);
    if (request.environment) params.set("environment", request.environment);

    return this.http.get<ListDomainsResponse>(`/mail/domains?${params.toString()}`);
  }

  /**
   * Add a new domain
   */
  async add(request: AddDomainRequest): Promise<AddDomainResponse> {
    return this.http.post<AddDomainResponse>("/mail/domains", request);
  }

  /**
   * Get DNS records for a domain
   */
  async getDnsRecords(domainId: string): Promise<GetDnsRecordsResponse> {
    return this.http.get<GetDnsRecordsResponse>(`/mail/domains/${domainId}/dns`);
  }

  /**
   * Verify a domain
   */
  async verify(domainId: string): Promise<VerifyDomainResponse> {
    return this.http.post<VerifyDomainResponse>(`/mail/domains/${domainId}/verify`, {});
  }

  /**
   * Delete a domain
   */
  async delete(domainId: string): Promise<DeleteDomainResponse> {
    return this.http.delete<DeleteDomainResponse>(`/mail/domains/${domainId}`);
  }

  /**
   * Set a domain as the default
   */
  async setDefault(domainId: string): Promise<SetDefaultDomainResponse> {
    return this.http.post<SetDefaultDomainResponse>(`/mail/domains/${domainId}/default`, {});
  }
}
