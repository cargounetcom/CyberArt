
export interface ChicagoObject {
  id: number;
  title: string;
  artist_display: string;
  date_display: string;
  image_id: string;
  department_title: string;
}

const BASE_URL = 'https://api.artic.edu/api/v1';

export async function fetchChicagoObjects(limit: number = 10): Promise<ChicagoObject[]> {
  try {
    const res = await fetch(`${BASE_URL}/artworks?limit=${limit}&fields=id,title,artist_display,date_display,image_id,department_title`);
    const data = await res.json();
    return data.data.filter((obj: any) => obj.image_id);
  } catch (error) {
    console.error('Error fetching Chicago objects:', error);
    return [];
  }
}

export async function searchChicagoObjects(query: string, limit: number = 10): Promise<ChicagoObject[]> {
  try {
    const res = await fetch(`${BASE_URL}/artworks/search?q=${encodeURIComponent(query)}&limit=${limit}&fields=id,title,artist_display,date_display,image_id,department_title`);
    const data = await res.json();
    return data.data.filter((obj: any) => obj.image_id);
  } catch (error) {
    console.error('Error searching Chicago objects:', error);
    return [];
  }
}

export const getChicagoImageUrl = (imageId: string) => 
  `https://www.artic.edu/iiif/2/${imageId}/full/843,/0/default.jpg`;
