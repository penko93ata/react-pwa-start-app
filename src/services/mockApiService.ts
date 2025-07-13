// This is a mock API service to simulate network requests.

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function mockApiRequest(data: any): Promise<{ success: boolean; data: any }> {
  // Simulate a network delay
  await new Promise((resolve) => setTimeout(resolve, 500));

  // In a real app, this would be a fetch() call to your server.
  // For this example, we'll just log the data and return a success response.
  console.log("Mock API request sent with:", data);
  return { success: true, data };
}
