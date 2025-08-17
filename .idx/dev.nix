{ pkgs }: {
  channel = "stable-24.05";
  packages = [
    pkgs.nodejs_22
    pkgs.hostname-debian
    pkgs.gh
  ];
  idx.extensions = [
    "dbaeumer.vscode-eslint"
    "esbenp.prettier-vscode"
    "firsttris.vscode-jest-runner"
    "github.vscode-github-actions"
    "GitHub.vscode-pull-request-github"
    "ms-playwright.playwright"
    "nrwl.angular-console"
    "rvest.vs-code-prettier-eslint"
  ];
  idx.workspace.onCreate = {
    npm-install = "npm install";
  };
  idx.previews = {
    previews = {
      web = {
        command = [
          "nx"
          "dev"
          "apps/main"
          "--port"
          "$PORT"
          "--hostname"
          "0.0.0.0"
        ];
        manager = "web";
      };
    };
  };
}
