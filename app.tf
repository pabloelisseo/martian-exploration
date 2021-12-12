terraform {
  required_providers {
    kubernetes = {
      source  = "hashicorp/kubernetes"
      version = ">= 2.0.0"
    }
  }
}
provider "kubernetes" {
  config_path = "~/.kube/config"
}
resource "kubernetes_namespace" "martian-exploration" {
  metadata {
    name = "martian-exploration"
  }
}

resource "kubernetes_secret" "database" {
  metadata {
    name = "database"
    namespace = kubernetes_namespace.martian-exploration.metadata.0.name
  }
  data = {
    DB_PROTOCOL="PUT SECRET HERE"
    DB_USERNAME="PUT SECRET HERE"
    DB_PASSWORD="PUT SECRET HERE"
    DB_NAME="PUT SECRET HERE"
    DB_HOST="PUT SECRET HERE"
    DB_OPTIONS_AUTH_SOURCE="PUT SECRET HERE"
    DB_OPTIONS_RETRY_WRITES="PUT SECRET HERE"
    DB_OPTIONS_W="PUT SECRET HERE"
  }
}
resource "kubernetes_secret" "crypto" {
  metadata {
    name = "crypto"
    namespace = kubernetes_namespace.martian-exploration.metadata.0.name
  }
  data = {
    ENCRYPTION_KEY="PUT SECRET HERE"
    ALGORITHM="PUT SECRET HERE"
    SALT="PUT SECRET HERE"
    IV="PUT SECRET HERE"
  }
}
resource "kubernetes_secret" "jwt" {
  metadata {
    name = "jwt"
    namespace = kubernetes_namespace.martian-exploration.metadata.0.name
  }
  data = {
    JWT_SECRET="PUT SECRET HERE"
  }
}
resource "kubernetes_secret" "api" {
  metadata {
    name = "api"
    namespace = kubernetes_namespace.martian-exploration.metadata.0.name
  }
  data = {
    API_PORT="PUT SECRET HERE"
  }
}
resource "kubernetes_deployment" "robot-service" {
  metadata {
    name      = "robot-service"
    namespace = kubernetes_namespace.martian-exploration.metadata.0.name
  }
  spec {
    replicas = 2
    selector {
      match_labels = {
        app = "robot-service"
      }
    }
    template {
      metadata {
        labels = {
          app = "robot-service"
        }
      }
      spec {
        container {
          image_pull_policy = "Never"
          image = "martian-exploration"
          name  = "martian-exploration-container"
          port {
            container_port = 8080
          }
          env_from {
            secret_ref {
              name = "database"
            }
          }
          env_from {
            secret_ref {
              name = "api"
            } 
          }
          env_from {
            secret_ref {
              name = "jwt"
            }
          }
          env_from {
            secret_ref {
              name = "crypto"
            }
          }
        }
      }
    }
  }
}

resource "kubernetes_service" "robot-service" {
  metadata {
    name      = "robot-service"
    namespace = kubernetes_namespace.martian-exploration.metadata.0.name
  }
  spec {
    selector = {
      app = kubernetes_deployment.robot-service.spec.0.template.0.metadata.0.labels.app
    }
    type = "NodePort"
    port {
      node_port   = 30201
      port        = 8080
      target_port = 8080
    }
  }
}
