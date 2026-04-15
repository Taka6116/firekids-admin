import { createServerRunner } from "@aws-amplify/adapter-nextjs";

import { getAmplifyResourcesConfig } from "@/lib/amplify-config";

export const { runWithAmplifyServerContext } = createServerRunner({
  config: getAmplifyResourcesConfig(),
});
