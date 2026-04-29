
export interface MetObject {
  objectID: number;
  title: string;
  artistDisplayName: string;
  objectDate: string;
  primaryImageSmall: string;
  repository: string;
  department: string;
  objectURL: string;
}

const BASE_URL = 'https://collectionapi.metmuseum.org/public/collection/v1';

export async function fetchMetObjects(limit: number = 10): Promise<MetObject[]> {
  try {
    const searchRes = await fetch(`${BASE_URL}/search?hasImages=true&q=paintings`);
    const searchData = await searchRes.json();
    
    if (!searchData.objectIDs || searchData.objectIDs.length === 0) {
      return [];
    }

    const objectIDs = searchData.objectIDs.slice(0, limit);

    const promises = objectIDs.map(async (id: number) => {
      const detailRes = await fetch(`${BASE_URL}/objects/${id}`);
      return detailRes.json();
    });

    const results = await Promise.all(promises);
    return results.filter(obj => obj.primaryImageSmall);
  } catch (error) {
    console.error('Error fetching Met objects:', error);
    return [];
  }
}

export async function searchMetObjects(query: string, limit: number = 10): Promise<MetObject[]> {
    try {
      const searchRes = await fetch(`${BASE_URL}/search?hasImages=true&q=${encodeURIComponent(query)}`);
      const searchData = await searchRes.json();
      
      if (!searchData.objectIDs || searchData.objectIDs.length === 0) {
        return [];
      }
  
      const objectIDs = searchData.objectIDs.slice(0, limit);
  
      const promises = objectIDs.map(async (id: number) => {
        const detailRes = await fetch(`${BASE_URL}/objects/${id}`);
        return detailRes.json();
      });
  
      const results = await Promise.all(promises);
      return results.filter(obj => obj.primaryImageSmall);
    } catch (error) {
      console.error('Error searching Met objects:', error);
      return [];
    }
  }
