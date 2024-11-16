import {
    type InvokeArgs,
    type InvokeOptions,
    invoke,
} from "@tauri-apps/api/core";
import { emit } from "@tauri-apps/api/event";

/**
 * safe invoke alternative of tauri invoke which doesn't raise error
 * but if there is any error than it will instead emit error message and return null value
 */
export async function safeInvoke<T>(
    cmd: string,
    args?: InvokeArgs,
    options?: InvokeOptions,
): Promise<T | null> {
    let invokeValue: T | null = null;
    try {
        invokeValue = await invoke(cmd, args, options);
    } catch (err) {
        emit("error-message", err).catch((_err) => {});
    }
    return invokeValue;
}
