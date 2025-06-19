export const validationUtils = {
  isValidPort: (port: string): boolean => {
    const portNum = Number(port.trim());
    return !isNaN(portNum) && portNum > 0 && portNum <= 65535;
  },

  validatePortInput: (value: string): string => {
    const port = value.trim();
    if (port && validationUtils.isValidPort(port)) {
      return port;
    }
    return '';
  }
}; 