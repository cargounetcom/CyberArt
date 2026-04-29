
export interface EuropeanaObject {
  id: string;
  title: string[];
  dcCreator?: string[];
  year?: string[];
  edmPreview?: string[];
  dataProvider: string[];
}

const BASE_URL = 'https://api.europeana.eu/record/v2';
// NOTE: Europeana usually requires a key. Using a generic search might work for some items.
// If this fails, we will fallback to mock or inform user.
const WSKEY = 'api2demo'; // Common demo key for Europeana

export async function fetchEuropeanaObjects(limit: number = 10): Promise<EuropeanaObject[]> {
  try {
    const res = await fetch(`${BASE_URL}/search.json?wskey=${WSKEY}&query=painting&rows=${limit}&media=true`);
    const data = await res.json();
    return data.items || [];
  } catch (error) {
    console.error('Error fetching Europeana objects:', error);
    return [];
  }
}

export async function searchEuropeanaObjects(query: string, limit: number = 10): Promise<EuropeanaObject[]> {
  try {
    const res = await fetch(`${BASE_URL}/search.json?wskey=${WSKEY}&query=${encodeURIComponent(query)}&rows=${limit}&media=true`);
    const data = await res.json();
    return data.items || [];
  } catch (error) {
    console.error('Error searching Europeana objects:', error);
    return [];
  }
}
