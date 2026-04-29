
export interface ClevelandObject {
  id: number;
  title: string;
  creators: { description: string }[];
  creation_date: string;
  images: { web: { url: string } };
  department: string;
}

const BASE_URL = 'https://openaccess-api.clevelandart.org/api/v1';

export async function fetchClevelandObjects(limit: number = 10): Promise<ClevelandObject[]> {
  try {
    const res = await fetch(`${BASE_URL}/artworks/?limit=${limit}&has_image=1`);
    const data = await res.json();
    return data.data;
  } catch (error) {
    console.error('Error fetching Cleveland objects:', error);
    return [];
  }
}

export async function searchClevelandObjects(query: string, limit: number = 10): Promise<ClevelandObject[]> {
  try {
    const res = await fetch(`${BASE_URL}/artworks/?q=${encodeURIComponent(query)}&limit=${limit}&has_image=1`);
    const data = await res.json();
    return data.data;
  } catch (error) {
    console.error('Error searching Cleveland objects:', error);
    return [];
  }
}
