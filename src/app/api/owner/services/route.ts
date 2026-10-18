import { handleService } from './handler';
export function GET() {
  return handleService();
}
export function POST(request: Request) {
  return handleService(request);
}
