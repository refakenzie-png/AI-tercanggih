import { NextRequest, NextResponse } from 'next/server';
import { discoverAutoPilotTasks, executeAutoPilotTask, monitorTaskExecution, runAutoPilotLoop } from '@/lib/autopilot-real';

export async function GET() {
  try {
    const tasks = discoverAutoPilotTasks();

    return NextResponse.json({
      success: true,
      tasks,
      count: tasks.length,
      message: 'Available auto-pilot tasks discovered',
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Task discovery failed',
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { task, signedTx } = body;

    if (!task || !signedTx) {
      return NextResponse.json(
        { error: 'Missing task or signedTx' },
        { status: 400 }
      );
    }

    const result = await executeAutoPilotTask(task, signedTx);

    return NextResponse.json({
      success: result.success,
      execution: result,
      message: result.success ? 'Task executed successfully' : 'Task execution failed',
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Task execution failed',
      },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { txHash, chainId } = body;

    if (!txHash || !chainId) {
      return NextResponse.json(
        { error: 'Missing txHash or chainId' },
        { status: 400 }
      );
    }

    const result = await monitorTaskExecution(txHash, chainId);

    return NextResponse.json({
      success: true,
      monitoring: result,
      message: result.confirmed ? 'Transaction confirmed' : 'Transaction pending',
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Monitoring failed',
      },
      { status: 500 }
    );
  }
}
