/**
 * Stack0 Integrations SDK
 * @module @stack0/sdk/integrations
 */

export { Integrations } from "./client";
export type {
  // Base types
  PaginatedResult as IntegrationsPaginatedResult,
  ListOptions as IntegrationsListOptions,
  ConnectorCategory,
  Connector,
  Connection,
  // Shared types
  Address as IntegrationAddress,
  PhoneNumber as IntegrationPhoneNumber,
  IntegrationEmailAddress,
  // CRM types
  Contact,
  CreateContactInput,
  UpdateContactInput,
  Company,
  CreateCompanyInput,
  UpdateCompanyInput,
  Deal,
  CreateDealInput,
  UpdateDealInput,
  // Storage types
  FilePermission as IntegrationFilePermission,
  File as IntegrationFile,
  IntegrationFolder,
  CreateFolderInput as IntegrationCreateFolderInput,
  UploadFileInput,
  // Communication types
  Channel,
  MessageAttachment as IntegrationMessageAttachment,
  MessageReaction as IntegrationMessageReaction,
  Message,
  SendMessageInput,
  CommunicationUser,
  // Productivity types
  Document as IntegrationDocument,
  CreateDocumentInput as IntegrationCreateDocumentInput,
  UpdateDocumentInput as IntegrationUpdateDocumentInput,
  ColumnType as IntegrationColumnType,
  SelectOption as IntegrationSelectOption,
  TableColumn as IntegrationTableColumn,
  Table as IntegrationTable,
  TableRow as IntegrationTableRow,
  CreateTableRowInput as IntegrationCreateTableRowInput,
  UpdateTableRowInput as IntegrationUpdateTableRowInput,
  // Passthrough
  PassthroughRequest,
} from "./types";
