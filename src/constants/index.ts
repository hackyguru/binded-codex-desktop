export const DEFAULT_PORTS = {
  DISCOVERY: "8090",
  LISTENING: "8070",
  API: "8080"
} as const;

export const LOCAL_STORAGE_KEYS = {
  DATA_DIRECTORY: 'codexDataDirectory',
  DISCOVERY_PORT: 'codexDiscoveryPort',
  LISTENING_PORT: 'codexListeningPort',
  API_PORT: 'codexApiPort'
} as const;

export const PROCESS_CHECK_INTERVAL = 5000; // 5 seconds

export const BOOTSTRAP_NODE = "spr:CiUIAhIhAiJvIcA_ZwPZ9ugVKDbmqwhJZaig5zKyLiuaicRcCGqLEgIDARo8CicAJQgCEiECIm8hwD9nA9n26BUoNuarCEllqKDnMrIuK5qJxFwIaosQ3d6esAYaCwoJBJ_f8zKRAnU6KkYwRAIgM0MvWNJL296kJ9gWvfatfmVvT-A7O2s8Mxp8l9c8EW0CIC-h-H-jBVSgFjg3Eny2u33qF7BDnWFzo7fGfZ7_qc9P";

export const COdex_COMMAND = 'binaries/codexdesktop'; 