import { ADMIN } from "./admin";
import { BUDDY } from "./buddy";
import { COMMON } from "./common";
import { HOST } from "./host";
import { PUBLIC } from "./public";
import { REFERENCE } from "./reference";
import { STUDENT } from "./student";

/** Thai text keyed by the English original. Split by area of the app only to keep files short. */
export const TH: Record<string, string> = { ...COMMON, ...REFERENCE, ...PUBLIC, ...STUDENT, ...HOST, ...BUDDY, ...ADMIN };
