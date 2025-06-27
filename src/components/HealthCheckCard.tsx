import React, { useState, useEffect } from 'react';
import { FiWifi, FiCheck, FiX, FiAlertTriangle } from 'react-icons/fi';
import { useCodexConfig } from '../hooks/useCodexConfig';
import { useCodexConnection } from '../hooks/useCodexConnection';

interface HealthCheckItem {
  name: string;
  status: 'checking' | 'success' | 'error';
  icon: React.ReactNode;
}

interface HealthCheckCardProps {
  isConnected: boolean;
  apiPort: string;
}

const HealthCheckCard: React.FC<HealthCheckCardProps> = ({ isConnected, apiPort }) => {
  const { discoveryPort, listeningPort } = useCodexConfig();
  const [healthChecks, setHealthChecks] = useState<HealthCheckItem[]>([
    { name: 'Internet connection', status: 'checking', icon: <FiWifi className="w-3 h-3" /> },
    { name: 'Codex connection', status: 'checking', icon: <FiCheck className="w-3 h-3" /> },
    { name: 'Port forwarding', status: 'checking', icon: <FiAlertTriangle className="w-3 h-3" /> },
  ]);

  const checkInternetConnection = async (): Promise<boolean> => {
    try {
      const response = await fetch('https://www.google.com', { 
        method: 'HEAD',
        mode: 'no-cors',
        cache: 'no-cache'
      });
      return true;
    } catch (error) {
      // Try alternative method - check if we can resolve DNS
      try {
        await fetch('https://8.8.8.8', { 
          method: 'HEAD',
          mode: 'no-cors',
          cache: 'no-cache'
        });
        return true;
      } catch (error2) {
        return false;
      }
    }
  };

  const getPublicIP = async (): Promise<string | null> => {
    try {
      const response = await fetch('https://api.ipify.org?format=json', {
        signal: AbortSignal.timeout(5000)
      });
      const data = await response.json();
      return data.ip;
    } catch (error) {
      console.error('Failed to get public IP:', error);
      return null;
    }
  };

  const checkPortForwarding = async (): Promise<boolean> => {
    try {
      // First check if Codex discovery service is running locally
      const localResponse = await fetch(`http://localhost:${discoveryPort}`, { 
        method: 'HEAD',
        signal: AbortSignal.timeout(2000)
      });
      
      // If local service is not running, port forwarding is irrelevant
      if (!localResponse.ok) {
        return false;
      }

      // Get public IP address
      const publicIP = await getPublicIP();
      if (!publicIP) {
        console.warn('Could not determine public IP, falling back to connection status');
        return isConnected;
      }

      // Try external port checking service
      try {
        const response = await fetch(`https://api.portchecker.io/check?host=${publicIP}&port=${discoveryPort}`, {
          signal: AbortSignal.timeout(10000)
        });
        
        if (response.ok) {
          const result = await response.json();
          console.log('Port check result:', result);
          return result.open === true || result.status === 'open';
        }
      } catch (error) {
        console.warn('External port checker failed:', error);
      }

      // Try alternative method using a different service
      try {
        // Use ipify to check if we can make external requests
        const testResponse = await fetch(`https://api.ipify.org/`, {
          signal: AbortSignal.timeout(5000)
        });
        
        if (testResponse.ok) {
          // If we can reach external services, but port checker failed,
          // the port is likely closed
          console.log('External connectivity OK, but port appears closed');
          return false;
        }
      } catch (error) {
        console.warn('External connectivity test failed:', error);
      }

      // Fallback: Try to determine if we're behind NAT
      try {
        // Get local IP (this is a simplified approach)
        const localIPResponse = await fetch('https://httpbin.org/ip', {
          signal: AbortSignal.timeout(5000)
        });
        const localData = await localIPResponse.json();
        
        // If public IP equals the IP we see from external services,
        // we might have a direct connection
        if (publicIP === localData.origin) {
          // Direct connection - port should be accessible if service is running
          return true;
        } else {
          // Behind NAT - need proper port forwarding
          // Since we can't reliably test this, we'll be conservative
          return false;
        }
      } catch (error) {
        console.warn('NAT detection failed:', error);
      }

      // Final fallback - if all external checks fail but Codex is connected,
      // there might be some connectivity (though not necessarily port forwarding)
      return false;
      
    } catch (error) {
      console.error('Port forwarding check failed:', error);
      return false;
    }
  };

  useEffect(() => {
    const runHealthChecks = async () => {
      // Reset all checks to checking state
      setHealthChecks(prev => prev.map(check => ({ ...check, status: 'checking' })));

      // Internet connection check
      const internetStatus = await checkInternetConnection();
      setHealthChecks(prev => prev.map(check => 
        check.name === 'Internet connection' 
          ? { ...check, status: internetStatus ? 'success' : 'error' }
          : check
      ));

      // Codex connection check (based on isConnected prop)
      setHealthChecks(prev => prev.map(check => 
        check.name === 'Codex connection' 
          ? { ...check, status: isConnected ? 'success' : 'error' }
          : check
      ));

      // Port forwarding check (this takes longer due to external API calls)
      console.log('Starting port forwarding check...');
      const portStatus = await checkPortForwarding();
      console.log('Port forwarding check result:', portStatus);
      setHealthChecks(prev => prev.map(check => 
        check.name === 'Port forwarding' 
          ? { ...check, status: portStatus ? 'success' : 'error' }
          : check
      ));
    };

    runHealthChecks();
  }, [isConnected, discoveryPort, listeningPort, apiPort]);

  const getStatusIcon = (status: 'checking' | 'success' | 'error') => {
    switch (status) {
      case 'checking':
        return <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />;
      case 'success':
        return <FiCheck className="w-4 h-4 text-black stroke-2" style={{ strokeWidth: 3 }} />;
      case 'error':
        return <FiX className="w-4 h-4 text-black stroke-2" style={{ strokeWidth: 3 }} />;
    }
  };

  const getOverallStatus = () => {
    const allSuccess = healthChecks.every(check => check.status === 'success');
    const anyError = healthChecks.some(check => check.status === 'error');
    const anyChecking = healthChecks.some(check => check.status === 'checking');

    if (anyChecking) return 'checking';
    if (allSuccess) return 'success';
    if (anyError) return 'error';
    return 'checking';
  };

  const overallStatus = getOverallStatus();

  return (
    <div className="group bg-gradient-to-br from-[#6BE4A8]/80 to-[#5DD49A]/70 rounded-3xl p-6 flex flex-col justify-between h-48 shadow-lg hover:shadow-xl transition-all duration-300 border border-[#6BE4A8]/30 backdrop-blur-sm">
      <div className="flex justify-between items-start">
        <div className="w-12 h-12 bg-black/15 flex items-center justify-center [clip-path:polygon(50%_0%,_100%_25%,_100%_75%,_50%_100%,_0%_75%,_0%_25%)] shadow-md transition-all duration-300 hover:scale-105">
          <FiWifi className="w-6 h-6 text-black" />
        </div>
        <div className="relative transition-all duration-500 group-hover:opacity-0 group-hover:-translate-y-4">
          <div className="w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 bg-black/15">
            {getStatusIcon(overallStatus)}
          </div>
        </div>
      </div>
      
      <div className="relative overflow-hidden">
        {/* Default view */}
        <div className="transition-all duration-500 group-hover:opacity-0 group-hover:-translate-y-4">
          <div className="mb-3">
            <p className={`text-4xl font-bold transition-all duration-500 ${
              overallStatus === 'success' ? 'text-black' : 
              overallStatus === 'error' ? 'text-red-800' : 
              'text-yellow-800'
            }`}>
              {overallStatus === 'success' ? 'Healthy' : 
               overallStatus === 'error' ? 'Issues' : 
               'Checking...'}
            </p>
            <p className="text-sm text-black/70 font-medium">Health Check</p>
          </div>
          
          <div className="text-center">
            <p className="text-xs text-black/60 font-medium">Hover for details</p>
          </div>
        </div>

        {/* Hover view */}
        <div className="absolute inset-0 transition-all duration-500 opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 flex flex-col justify-center py-2">
          <div className="space-y-1">
            {healthChecks.map((check, index) => (
              <div key={index} className="flex items-center justify-between px-3 py-1 rounded bg-black/10">
                <span className="text-black font-medium text-[9px] leading-none">
                  {check.name}
                </span>
                <div className="w-4 h-4 flex items-center justify-center flex-shrink-0 ml-1">
                  {getStatusIcon(check.status)}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HealthCheckCard; 