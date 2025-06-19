export interface CodexConfig {
  dataDirectory: string;
  discoveryPort: string;
  listeningPort: string;
  apiPort: string;
}

export interface CodexProcess {
  child: any;
  isRunning: boolean;
  isStarting: boolean;
}

export interface PortConfig {
  discoveryPort: string;
  listeningPort: string;
  apiPort: string;
}

export interface DirectoryConfig {
  dataDirectory: string;
  isDirectorySet: boolean;
} 