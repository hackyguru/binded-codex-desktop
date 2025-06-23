import { useState, useEffect } from 'react';

interface GeoInfo {
  country: string;
  countryCode: string;
  flag: string;
  city?: string;
  region?: string;
}

export const useGeoLocation = (addresses: string[]) => {
  const [geoData, setGeoData] = useState<Record<string, GeoInfo>>({});
  const [loading, setLoading] = useState(false);
  const [lastProcessedAddresses, setLastProcessedAddresses] = useState<string>('');

  // Function to extract IP from various address formats
  const extractIP = (address: string): string | null => {
    console.log('Extracting IP from:', address);
    
    // Handle multiaddr format: /ip4/192.168.1.1/tcp/8080
    const multiaddrMatch = address.match(/\/ip4\/([0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3})/);
    if (multiaddrMatch) {
      const ip = multiaddrMatch[1];
      console.log('Extracted IP from multiaddr:', ip);
      return ip;
    }

    // Handle simple IP:port format: 142.93.232.159:30550
    const simpleMatch = address.match(/^([0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}):/);
    if (simpleMatch) {
      const ip = simpleMatch[1];
      console.log('Extracted IP from simple format:', ip);
      return ip;
    }

    // Handle just IP: 142.93.232.159
    const ipOnlyMatch = address.match(/^([0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3})$/);
    if (ipOnlyMatch) {
      const ip = ipOnlyMatch[1];
      console.log('IP only format:', ip);
      return ip;
    }

    console.log('Could not extract IP from:', address);
    return null;
  };

  // Function to get country flag emoji from country code
  const getFlag = (countryCode: string): string => {
    if (!countryCode || countryCode.length !== 2) return '🌍';
    
    // Convert country code to flag emoji
    const flagOffset = 0x1f1e6;
    const asciiOffset = 0x41;
    const firstChar = countryCode.toUpperCase().charCodeAt(0) - asciiOffset + flagOffset;
    const secondChar = countryCode.toUpperCase().charCodeAt(1) - asciiOffset + flagOffset;
    
    return String.fromCodePoint(firstChar, secondChar);
  };

  // Function to check if IP is private/local
  const isPrivateIP = (ip: string): boolean => {
    return (
      ip.startsWith('192.168.') ||
      ip.startsWith('10.') ||
      ip.startsWith('172.') ||
      ip === '127.0.0.1' ||
      ip.startsWith('169.254.')
    );
  };

  // Function to get geo info from IP using free API
  const getGeoFromIP = async (ip: string): Promise<GeoInfo> => {
    try {
      console.log('Fetching geo data for IP:', ip);
      
      // Using ip-api.com - free, no API key required, 1000 requests per minute
      const response = await fetch(`http://ip-api.com/json/${ip}?fields=status,country,countryCode,city,regionName`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('API response for', ip, ':', data);
      
      if (data.status === 'success') {
        const flag = getFlag(data.countryCode);
        return {
          country: data.country || 'Unknown',
          countryCode: data.countryCode || '',
          flag: flag,
          city: data.city || 'Unknown',
          region: data.regionName || 'Unknown'
        };
      } else {
        console.warn('API returned failure for', ip, ':', data);
        return {
          country: 'Unknown',
          countryCode: '',
          flag: '🌍',
          city: 'Unknown'
        };
      }
    } catch (error) {
      console.error('Error fetching geo data for', ip, ':', error);
      return {
        country: 'Unknown',
        countryCode: '',
        flag: '🌍',
        city: 'Unknown'
      };
    }
  };

  const processAddresses = async () => {
    console.log('Processing addresses:', addresses);
    setLoading(true);
    
    const newGeoData: Record<string, GeoInfo> = {};

    // Process each address
    for (const address of addresses) {
      const ip = extractIP(address);
      
      if (!ip) {
        console.log('Skipping address (no IP):', address);
        newGeoData[address] = {
          country: 'Unknown',
          countryCode: '',
          flag: '🌍',
          city: 'Unknown'
        };
        continue;
      }

      // Handle private/local IPs
      if (isPrivateIP(ip)) {
        console.log('Skipping private IP:', ip);
        newGeoData[address] = {
          country: 'Local',
          countryCode: 'LOCAL',
          flag: '🏠',
          city: 'Private Network'
        };
        continue;
      }

      // Get geo data for public IPs
      const geoInfo = await getGeoFromIP(ip);
      newGeoData[address] = geoInfo;
      
      // Add a small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    console.log('Final geo data:', newGeoData);
    setGeoData(newGeoData);
    setLoading(false);
  };

  useEffect(() => {
    const addressesString = addresses.join(',');
    
    // Only process if addresses have actually changed
    if (addresses.length > 0 && addressesString !== lastProcessedAddresses) {
      console.log('Addresses changed, processing geo data...');
      setLastProcessedAddresses(addressesString);
      processAddresses();
    }
  }, [addresses.join(','), lastProcessedAddresses]);

  const refresh = () => {
    console.log('Manually refreshing geo data...');
    processAddresses();
  };

  return { geoData, loading, refresh };
}; 