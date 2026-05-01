
export interface TateObject {
  id: string;
  title: string[];
  dcCreator?: string[];
  year?: string[];
  edmPreview?: string[];
  edmIsShownBy?: string[];
  dataProvider: string[];
}

const BASE_URL = 'https://api.europeana.eu/record/v2';
const WSKEY = 'api2demo'; // Common demo key for Europeana

export async function fetchTateObjects(limit: number = 12): Promise<TateObject[]> {
  try {
    // Broader search for Tate to ensure we get results
    const res = await fetch(`${BASE_URL}/search.json?wskey=${WSKEY}&query=Tate&rows=${limit}&media=true`);
    const data = await res.json();
    return (data.items || []).filter((item: any) => 
      item.dataProvider?.some((dp: string) => dp.toLowerCase().includes('tate')) ||
      item.title?.[0]?.toLowerCase().includes('tate')
    );
  } catch (error) {
    console.error('Error fetching Tate objects:', error);
    return [];
  }
}

export async function searchTateObjects(query: string, limit: number = 12): Promise<TateObject[]> {
  try {
    // Search with Tate as a context
    const res = await fetch(`${BASE_URL}/search.json?wskey=${WSKEY}&query=${encodeURIComponent(query)}+Tate&rows=${limit}&media=true`);
    const data = await res.json();
    return data.items || [];
  } catch (error) {
    console.error('Error searching Tate objects:', error);
    return [];
  }
}
