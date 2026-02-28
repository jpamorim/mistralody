const STORAGE_KEY_PREFIX = "mistralody-pane-layout-";

const noopStorage: Pick<Storage, "getItem" | "setItem"> = {
  getItem: () => null,
  setItem: () => {},
};

export function getPaneLayoutStorage(): Pick<Storage, "getItem" | "setItem"> {
  if (typeof window === "undefined") return noopStorage;
  return {
    getItem: (key: string) => localStorage.getItem(STORAGE_KEY_PREFIX + key),
    setItem: (key: string, value: string) =>
      localStorage.setItem(STORAGE_KEY_PREFIX + key, value),
  };
}
