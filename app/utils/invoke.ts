import {
    type InvokeArgs,
    type InvokeOptions,
    invoke,
} from "@tauri-apps/api/core";
import { emit } from "@tauri-apps/api/event";
import { type ErrorFormat, errorFormat } from "./error";

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
        const result = errorFormat.safeParse(err);
        if (result.success) {
            emit("error-message", result.data).catch((_err) => {});
        } else {
            const errorMessage: ErrorFormat = {
                message: JSON.stringify(err),
                errors: result.error.issues.map(
                    (zodError) =>
                        `zod error ! ${zodError.path} (${zodError.code}) : ${zodError.message}`,
                ),
            };
            emit("error-message", errorMessage).catch((_err) => {});
        }
    }
    return invokeValue;
}
