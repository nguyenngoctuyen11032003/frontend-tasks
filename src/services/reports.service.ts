/**
 * DTOs from backend - must match backend types
 */
export enum ReportType {
  TASKS = 'tasks',
  PROJECTS = 'projects',
  USERS = 'users',
  ACTIVITY = 'activity',
  PERFORMANCE = 'performance',
}

export enum ChartType {
  TASK_STATUS = 'task_status',
  TASK_PRIORITY = 'task_priority',
  PROJECT_STATUS = 'project_status',
  USER_ACTIVITY = 'user_activity',
  TASK_COMPLETION_TREND = 'task_completion_trend',
}

export enum ExportFormat {
  CSV = 'csv',
  PDF = 'pdf',
  EXCEL = 'excel',
}

/**
 * Request DTOs
 */
export interface GenerateReportRequest {
  type: ReportType;
  startDate: string;
  endDate: string;
  projectId?: string;
  userId?: string;
  format: ExportFormat;
}

export interface GetChartDataRequest {
  type: ChartType;
  startDate: string;
  endDate: string;
  projectId?: string;
  userId?: string;
}

/**
 * Response DTOs
 */
export interface ChartDataPoint {
  date?: string;
  label?: string;
  value: number;
  name?: string;
  _id?: string;
  count?: number;
  percentage?: number;
}

export interface ChartDataResponse {
  type: ChartType;
  data: ChartDataPoint[];
}

export interface StatisticsResponse {
  totalTasks: number;
  totalProjects: number;
  totalUsers: number;
  completedTasks: number;
  activeTasks: number;
  completionRate: number;
  projectsInProgress: number;
  projectsCompleted: number;
  activeUsers: number;
  tasksByStatus: Record<string, number>;
  tasksByPriority: Record<string, number>;
}

export interface GenerateReportResponse {
  reportTitle: string;
  generatedAt: string;
  format: ExportFormat;
  data?: any;
  content?: string;
  filename?: string;
  message?: string;
}

/**
 * API Error handling
 */
export class ReportsApiError extends Error {
  constructor(
    public statusCode: number,
    message: string,
    public data?: any,
  ) {
    super(message);
    this.name = 'ReportsApiError';
  }
}

/**
 * Helper: Get auth headers
 */
function getAuthHeaders(): Record<string, string> {
  const authStorage = typeof window !== 'undefined' ? localStorage.getItem('auth-storage') : null;
  let token = null;

  if (authStorage) {
    try {
      const { state } = JSON.parse(authStorage);
      token = state?.token;
    } catch (e) {
      console.warn('Failed to parse auth storage');
    }
  }

  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
  };
}

/**
 * Reports Service
 * Handles all API calls to the Reports backend module
 * Uses fetch with the existing auth pattern from the app
 */
class ReportsService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = process.env.NEXT_PUBLIC_API_URL || '/api';
  }

  /**
   * Make a fetch request
   */
  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const headers = {
      ...getAuthHeaders(),
      ...options.headers,
    };

    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        ...options,
        headers,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
        
        const statusCode = response.status;
        const errorMessage = (errorData as any)?.message || `Error ${statusCode}`;

        throw new ReportsApiError(statusCode, errorMessage, errorData);
      }

      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        return response.json();
      }

      return response as unknown as T;
    } catch (error) {
      if (error instanceof ReportsApiError) {
        throw error;
      }

      throw new ReportsApiError(500, 'Network error', error);
    }
  }

  /**
   * Get overall statistics
   * GET /reports/statistics
   */
  async getStatistics(): Promise<StatisticsResponse> {
    try {
      const data = await this.request<StatisticsResponse>('/reports/statistics');
      if (!data) {
        throw new ReportsApiError(500, 'No data received from statistics endpoint');
      }
      return data;
    } catch (error) {
      throw this.handleError(error, 'Failed to fetch statistics');
    }
  }

  /**
   * Get chart data for a specific chart type
   * GET /reports/charts?type={chartType}&startDate={date}&endDate={date}
   */
  async getChartData(request: GetChartDataRequest): Promise<ChartDataResponse> {
    try {
      const params = new URLSearchParams({
        type: request.type,
        startDate: request.startDate,
        endDate: request.endDate,
      });

      if (request.projectId) {
        params.append('projectId', request.projectId);
      }

      if (request.userId) {
        params.append('userId', request.userId);
      }

      const data = await this.request<ChartDataResponse>(
        `/reports/charts?${params.toString()}`
      );

      if (!data) {
        throw new ReportsApiError(500, 'No data received from charts endpoint');
      }

      return data;
    } catch (error) {
      throw this.handleError(error, `Failed to fetch chart data for ${request.type}`);
    }
  }

  /**
   * Generate a report and optionally export it
   * POST /reports/generate
   */
  async generateReport(request: GenerateReportRequest): Promise<GenerateReportResponse> {
    try {
      const data = await this.request<GenerateReportResponse>(
        '/reports/generate',
        {
          method: 'POST',
          body: JSON.stringify({
            type: request.type,
            startDate: request.startDate,
            endDate: request.endDate,
            projectId: request.projectId,
            userId: request.userId,
            format: request.format,
          }),
        }
      );

      if (!data) {
        throw new ReportsApiError(500, 'No data received from generate report endpoint');
      }

      return data;
    } catch (error) {
      throw this.handleError(error, `Failed to generate ${request.type} report`);
    }
  }

  /**
   * Download a report file (CSV/PDF/Excel)
   * POST /reports/generate with format and streaming response
   */
  async downloadReport(request: GenerateReportRequest): Promise<Blob> {
    try {
      const response = await fetch(`${this.baseUrl}/reports/generate`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          type: request.type,
          startDate: request.startDate,
          endDate: request.endDate,
          projectId: request.projectId,
          userId: request.userId,
          format: request.format,
        }),
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({ message: 'Download failed' }));
        throw new ReportsApiError(
          response.status,
          (error as any).message || `Failed to download report (${response.status})`,
          error
        );
      }

      const blob = await response.blob();
      if (!blob || blob.size === 0) {
        throw new ReportsApiError(500, 'No file received from download endpoint');
      }

      return blob;
    } catch (error) {
      throw this.handleError(error, `Failed to download ${request.type} report`);
    }
  }

  /**
   * Get all chart types data in parallel
   * Fetches all 5 chart types at once for initial page load
   */
  async getAllChartData(startDate: string, endDate: string): Promise<ChartDataResponse[]> {
    try {
      const chartTypes = Object.values(ChartType);

      const requests = chartTypes.map((chartType) =>
        this.getChartData({
          type: chartType as ChartType,
          startDate,
          endDate,
        }),
      );

      const results = await Promise.all(requests);
      return results;
    } catch (error) {
      throw this.handleError(error, 'Failed to fetch all chart data');
    }
  }

  /**
   * Get team performance data
   * GET /reports/team-performance
   */
  async getTeamPerformance(): Promise<any[]> {
    try {
      const data = await this.request<any[]>('/reports/team-performance');
      if (!data) {
        throw new ReportsApiError(500, 'No data received from team performance endpoint');
      }
      return data;
    } catch (error) {
      throw this.handleError(error, 'Failed to fetch team performance');
    }
  }

  /**
   * Get projects statistics
   * GET /reports/projects-statistics
   */
  async getProjectsStatistics(): Promise<any[]> {
    try {
      const data = await this.request<any[]>('/reports/projects-statistics');
      if (!data) {
        throw new ReportsApiError(500, 'No data received from projects statistics endpoint');
      }
      return data;
    } catch (error) {
      throw this.handleError(error, 'Failed to fetch projects statistics');
    }
  }

  /**
   * Helper: Handle API errors
   */
  private handleError(error: unknown, defaultMessage: string): never {
    if (error instanceof ReportsApiError) {
      throw error;
    }

    if (error instanceof Error) {
      // Handle specific error messages
      if (error.message.includes('Unauthorized') || error.message.includes('401')) {
        throw new ReportsApiError(401, 'Unauthorized. Please log in again.', error);
      }

      if (error.message.includes('Forbidden') || error.message.includes('403')) {
        throw new ReportsApiError(
          403,
          'You do not have permission to access reports.',
          error
        );
      }

      if (error.message.includes('Not Found') || error.message.includes('404')) {
        throw new ReportsApiError(404, 'Report endpoint not found', error);
      }

      if (error.message.includes('Failed to fetch')) {
        throw new ReportsApiError(
          0,
          'Network error. Please check your connection.',
          error.message,
        );
      }

      throw new ReportsApiError(500, defaultMessage, error.message);
    }

    throw new ReportsApiError(500, defaultMessage, error);
  }
}

// Export singleton instance
export const reportsService = new ReportsService();
