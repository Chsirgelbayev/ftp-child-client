import { AccessOptions, Client, FTPResponse } from 'basic-ftp';
import { BufferWritable } from './buffer-writable';

export interface FtpClientOptions extends AccessOptions {
  readonly isVerbose: boolean;
}

export class FtpClient extends Client {
  protected options: FtpClientOptions;
  protected name: string;
  private readonly ftpClients: FtpClient[] = [];

  constructor(name?: string, timeout?: number) {
    super(timeout);
    this.name = name || 'main';
  }

  async access(options: FtpClientOptions): Promise<FTPResponse> {
    const access = await super.access(options);
    if (this.options.isVerbose) {
      this.ftp.verbose = true;
    }
    this.options = options;
    return access;
  }

  async reconnect() {
    await this.access(this.options).catch((err) =>
      console.log(`FTP ${this.name} client reconnect error: ${err.message}`)
    );
  }

  async createChildFtpClient() {
    const folders = await this.list();

    for (const folder of folders) {
      const ftpClient = new FtpClient(folder.name);
      if (this.options.isVerbose) {
        ftpClient.ftp.verbose = true;
      }
      await ftpClient.access(this.options);
      this.afterAccess(folder.name);
      this.ftpClients.push(ftpClient);
    }

    return this.ftpClients;
  }

  async downloadToBuffer(remotePath: string) {
    const bufferWritable = new BufferWritable();
    await this.downloadTo(bufferWritable, remotePath);
    return bufferWritable.getContents();
  }

  private afterAccess(name: string): void {
    console.log(`FTP ${name} client ready`);
  }
}
