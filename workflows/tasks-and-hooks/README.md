# Order native tasks and build hooks

A native Node build consumes a file prepared by an explicit, target-qualified pre-build hook. The hook depends on a qualified input check, and a post-build hook checks that native output exists. A normal configuration profile changes the resolved environment. This recipe selects captured execution: provision a supported Docker engine and the documented npm/Node executor first.

## Build and observe

Copy the entire project/ outside the collection, retain LICENSE, and use its normal pinned Node/npm environment. Run:

~~~sh
oyzu install --frozen
oyzu build --plan
oyzu build --isolated --full
oyzu inspect dist
~~~

Run the delivered directory's index.cjs with the selected Node. Expect Hello from tasks: local. Repeat with oyzu --profile preview build --isolated --full and expect Hello from tasks: preview. The resolved profile changes data, not authority. Try an invalid GREETING_MODE in a local configuration override: the input prerequisite must fail, and no dependent build becomes successful. Use oyzu run list to inspect authored and builder tasks without executing them.

## Configuration owner

<!-- example-source: project/oyzu.toml -->

## Prerequisites, failures and cleanup

No account, credential or unrelated runtime is needed. Initial tool/native dependency preparation needs network access; later offline use requires those exact cached prerequisites. Native shell differences affect how environment variables are set, not Oyzu's task contract. Correct the reported task, missing selected artifact or prerequisite and retry; preserve failed outcomes. No production readiness, private-dependency access, cloud deployment or broader host qualification is implied. Remove only this copied project's outputs and stop the task you started. Obtain the exact displayed source commit before copying. See [task behavior](https://docs.oyzu.ai/docs/reference/build-tasks) and [configuration](https://docs.oyzu.ai/docs/reference/configuration).
