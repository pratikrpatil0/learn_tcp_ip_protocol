import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const version = searchParams.get('version');
  const type = searchParams.get('type');

  if (version === null || type === null) {
    return NextResponse.json({ error: 'Missing parameters' }, { status: 400 });
  }

  if (type !== 'sender' && type !== 'receiver') {
    return NextResponse.json({ error: 'Invalid type' }, { status: 400 });
  }

  // Sanitize the input to prevent directory traversal
  const safeVersion = parseInt(version, 10);
  if (isNaN(safeVersion) || safeVersion < 0 || safeVersion > 24) {
    return NextResponse.json({ error: 'Invalid version' }, { status: 400 });
  }

  const fileName = `${type}_${safeVersion}.c`;
  // The files are located in the my_final_grad_project directory
  const filePath = path.join(process.cwd(), 'my_final_grad_project', fileName);

  try {
    const fileContent = fs.readFileSync(filePath, 'utf8');
    return NextResponse.json({ code: fileContent });
  } catch (error) {
    return NextResponse.json({ error: 'File not found' }, { status: 404 });
  }
}
