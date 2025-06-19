import { invoke } from "@tauri-apps/api/core";
import { Command } from '@tauri-apps/plugin-shell';
import { BOOTSTRAP_NODE, COdex_COMMAND } from '../constants';

export const codexService = {
  killExistingProcesses: async (): Promise<void> => {
    try {
      // Try pkill first
      try {
        await invoke('execute_command', { 
          command: 'pkill', 
          args: ['-f', 'codexdesktop'] 
        });
      } catch (error) {
        // If pkill fails, try killall
        try {
          await invoke('execute_command', { 
            command: 'killall', 
            args: ['codexdesktop'] 
          });
        } catch (killallError) {
          // Both failed, that's okay
          console.log("No existing Codex processes found or already killed");
        }
      }
      
      // Wait for processes to fully terminate
      await new Promise(resolve => setTimeout(resolve, 2000));
      
    } catch (error) {
      console.log("No existing Codex processes found or already killed");
    }
  },

  checkExistingProcesses: async (): Promise<string> => {
    try {
      const result = await invoke('execute_command', { 
        command: 'ps', 
        args: ['aux'] 
      }) as string;
      
      if (result.includes('codexdesktop')) {
        return "Found existing Codex processes. Use 'Kill Codex' to stop them.";
      } else {
        return "No existing Codex processes found.";
      }
    } catch (error) {
      return `Error checking for existing processes: ${error}`;
    }
  },

  startCodex: async (
    dataDirectory: string,
    discoveryPort: string,
    listeningPort: string,
    apiPort: string
  ): Promise<any> => {
    const args = [
      `--data-dir=${dataDirectory}`,
      `--disc-port=${discoveryPort}`,
      `--listen-addrs=/ip4/0.0.0.0/tcp/${listeningPort}`,
      "--nat=any",
      "--api-cors-origin=*",
      `--api-port=${apiPort}`,
      `--bootstrap-node=${BOOTSTRAP_NODE}`
    ];

    const command = Command.sidecar(COdex_COMMAND, args);
    
    // Try to execute first to see if there are any immediate errors
    try {
      const result = await command.execute();
      throw new Error(`Codex executed and exited:\nExit code: ${result.code}\nOutput: ${result.stdout}\nError: ${result.stderr}`);
    } catch (executeError) {
      // If execute fails, try spawn instead
      if (executeError instanceof Error && executeError.message.includes('Codex executed and exited')) {
        throw executeError;
      }
      console.log(`Execute failed, trying spawn: ${executeError}`);
    }
    
    return await command.spawn();
  },

  checkProcessStatus: async (child: any): Promise<boolean> => {
    if (!child) return false;
    
    try {
      // Try to kill the process with signal 0 (just check if it's alive)
      await child.kill(0);
      return true; // Process is still running
    } catch (error) {
      return false; // Process is no longer running
    }
  }
}; 