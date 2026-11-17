 type JsonPrimitive = string | number | boolean | null;
 type JsonObject = { [key: string]: JsonValue };
 type JsonArray = JsonValue[];

export type JsonValue = JsonPrimitive | JsonObject | JsonArray;