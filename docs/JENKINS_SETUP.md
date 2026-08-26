# Jenkins CI/CD

Your existing `Jenkinsfile` already builds, tests, and pushes images for
all six deployed services to ECR (Windows/`bat` agent). I extended it
with two things it was missing:

1. **Push `:latest`, not just `:ci`.** The ECS task definitions in
   `terraform/main.tf` hardcode the `:latest` tag for every image. The
   pipeline was only tagging/pushing `:ci`, so a deploy would never
   actually pick up a new build. Both stages now push `:ci` (for
   traceability of what a given Jenkins build produced) and `:latest`
   (what ECS pulls).
2. **Deploy to ECS.** Two new stages after "Verify ECR Images":
   `Deploy to ECS` (calls `aws ecs update-service --force-new-deployment`
   for all six services, which pulls the fresh `:latest` image) and
   `Wait for ECS Stability` (`aws ecs wait services-stable` for each, so
   the build only reports success once the new tasks are actually
   healthy). Neither of these touches the ECS task definitions
   themselves - those stay owned by Terraform, so there's no drift
   between what Terraform applied and what's running.

`config-server` and the frontend still aren't part of this pipeline -
neither has an ECR repo or ECS service in Terraform yet.

## What changed in `terraform/main.tf`

Two ECR repos existed only in the task definitions, not as real
resources (`taskflow-discovery-server`, `taskflow-api-gateway`) - the
pipeline's push stage for those two would have failed with "repository
does not exist" the first time it ran. Both are now declared.

Also added: a new IAM user (`taskflow-jenkins-cicd`) scoped to exactly
what this pipeline needs - push/pull on this app's six ECR repos, and
`UpdateService`/`DescribeServices`/`ListTasks`/`DescribeTasks` on ECS
services inside the `taskflow-pro-cluster` cluster only.

Run `terraform apply`, then get its key:

```
terraform output jenkins_cicd_access_key_id
terraform output -raw jenkins_cicd_secret_access_key
```

## Point the existing `aws-ecr-credentials` credential at it

The pipeline already references a Jenkins credential named
`aws-ecr-credentials` (Username = access key ID, Password = secret
access key) for the ECR stages - I didn't rename it. Whatever key is in
there now presumably already has ECR push access but almost certainly
not the ECS permissions the new Deploy stage needs.

Simplest fix: update that same credential's Username/Password to the
two `terraform output` values above. No Jenkinsfile change needed -
the ID stays `aws-ecr-credentials`, it just now points at a key with
push + deploy permissions instead of push-only.

(Jenkins -> Manage Jenkins -> Credentials -> find `aws-ecr-credentials`
-> Update.)

## Try it

Run the pipeline. If it gets through "Wait for ECS Stability" without
timing out, all six services are running the image this build just
pushed.
