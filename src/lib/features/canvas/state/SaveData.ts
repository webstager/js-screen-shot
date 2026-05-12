import { SESSION_STORAGE_MAX_BYTES } from "@/lib/constants/storage";

// 保存数据的主函数
export function saveData(data: any, key: string): void {
  const dataSize = getDataSize(data);

  if (dataSize <= SESSION_STORAGE_MAX_BYTES) {
    // 判断数据大小是否小于等于 5MB
    // 数据小于 5MB，存储在 sessionStorage
    sessionStorage.setItem(key, JSON.stringify(data));
  } else {
    // 数据大于 5MB，存储在 IndexedDB
    saveDataToIndexedDB(JSON.stringify(data), key);
  }
}

// 用来计算数据大小（字节数）
const getDataSize = (data: any): number => {
  const jsonData = JSON.stringify(data);
  // 使用 Blob 来计算字节大小
  return new Blob([jsonData]).size;
};

// 将数据存储到 IndexedDB
const saveDataToIndexedDB = (data: any, key: string): void => {
  const request = indexedDB.open("js-screen-shot-db", 1);

  // 如果数据库需要升级，创建一个对象存储
  request.onupgradeneeded = (event: IDBVersionChangeEvent) => {
    const db = (event.target as IDBRequest).result as IDBDatabase;
    if (!db.objectStoreNames.contains("dataStore")) {
      db.createObjectStore("dataStore");
    }
  };

  // 成功打开数据库后执行
  request.onsuccess = (event: Event) => {
    const db = (event.target as IDBRequest).result as IDBDatabase;
    const transaction = db.transaction(["dataStore"], "readwrite");
    const store = transaction.objectStore("dataStore");
    store.put(data, key); // 使用传入的 key 存储数据
  };

  // 处理打开 IndexedDB 时的错误
  request.onerror = (event: Event) => {
    console.error(
      "Error opening IndexedDB:",
      (event.target as IDBRequest).error
    );
  };
};
