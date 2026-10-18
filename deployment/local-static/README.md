# Serve the selected static artifact locally

Build static files independently, then serve that exact selected artifact through an explicit local development task. This is a generic task invoking Node, not a native deployment provider or a production web server.

## Build and observe

Copy the entire project/ outside the collection, retain LICENSE, and use its normal pinned Node/npm environment. Run:

~~~sh
oyzu install --frozen
oyzu build --plan
oyzu build
oyzu inspect dist
~~~

Read the delivered directory path and identity from dist/manifest.json. Set SITE_DIR to that absolute directory and PORT to an unused local port, using your shell's ordinary environment syntax. Then run oyzu run serve. Request http://127.0.0.1:`<port>`/ and expect Served from the selected artifact. Stop the task with Ctrl+C. The task serves bytes from the selected artifact directory and does not rebuild; changing a checkout file cannot change the running response. Verify the bundle before selecting it. The verification harness observes the response and compares the served bytes with the artifact.

## Configuration owner

<!-- example-source: project/oyzu.toml -->

## Prerequisites, failures and cleanup

No account, credential or unrelated runtime is needed. Initial tool/native dependency preparation needs network access; later offline use requires those exact cached prerequisites. Native shell differences affect how environment variables are set, not Oyzu's task contract. Correct the reported task, missing selected artifact or prerequisite and retry; preserve failed outcomes. No production readiness, private-dependency access, cloud deployment or broader host qualification is implied. Remove only this copied project's outputs and stop the task you started. Obtain the exact displayed source commit before copying. See [task behavior](https://docs.oyzu.ai/docs/reference/build-tasks) and [configuration](https://docs.oyzu.ai/docs/reference/configuration).
