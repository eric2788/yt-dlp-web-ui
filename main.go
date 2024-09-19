package main

import (
	"embed"
	"flag"
	"io/fs"
	"log"
	"log/slog"
	"os"
	"runtime"

	"github.com/marcopeocchi/yt-dlp-web-ui/server"
	"github.com/marcopeocchi/yt-dlp-web-ui/server/cli"
	"github.com/marcopeocchi/yt-dlp-web-ui/server/config"
	"github.com/marcopeocchi/yt-dlp-web-ui/server/openid"
)

var (
	host              string
	port              int
	queueSize         int
	configFile        string
	downloadPath      string
	downloaderPath    string
	sessionFilePath   string
	localDatabasePath string

	requireAuth bool
	username    string
	password    string

	userFromEnv = os.Getenv("USERNAME")
	passFromEnv = os.Getenv("PASSWORD")

	logFile           string
	enableFileLogging bool

	//go:embed frontend/dist/index.html
	//go:embed frontend/dist/assets/*
	frontend embed.FS

	//go:embed openapi/*
	swagger embed.FS
)

func init() {
	flag.StringVar(&host, "host", "0.0.0.0", "Host where server will listen at")
	flag.IntVar(&port, "port", 3033, "Port where server will listen at")
	flag.IntVar(&queueSize, "qs", 2, "Queue size (concurrent downloads)")

	flag.StringVar(&configFile, "conf", "./config.yml", "Config file path")
	flag.StringVar(&downloadPath, "out", ".", "Where files will be saved")
	flag.StringVar(&downloaderPath, "driver", "yt-dlp", "yt-dlp executable path")
	flag.StringVar(&sessionFilePath, "session", ".", "session file path")
	flag.StringVar(&localDatabasePath, "db", "local.db", "local database path")

	flag.BoolVar(&enableFileLogging, "fl", false, "enable outputting logs to a file")
	flag.StringVar(&logFile, "lf", "yt-dlp-webui.log", "set log file location")

	flag.BoolVar(&requireAuth, "auth", false, "Enable RPC authentication")
	flag.StringVar(&username, "user", userFromEnv, "Username required for auth")
	flag.StringVar(&password, "pass", passFromEnv, "Password required for auth")

	flag.Parse()
}

func main() {
	frontend, err := fs.Sub(frontend, "frontend/dist")
	if err != nil {
		log.Fatalln(err)
	}

	c := config.Instance()

	{
		// init the config struct with the values from flags
		// TODO: find an alternative way to populate the config struct from flags or config file
		c.Host = host
		c.Port = port

		c.QueueSize = queueSize

		c.DownloadPath = downloadPath
		c.DownloaderPath = downloaderPath
		c.SessionFilePath = sessionFilePath
		c.LocalDatabasePath = localDatabasePath

		c.LogPath = logFile
		c.EnableFileLogging = enableFileLogging

		c.RequireAuth = requireAuth
		c.Username = username
		c.Password = password
	}

	// if download path not found, create it
	if err := os.MkdirAll(c.DownloadPath, 0755); err != nil {
		log.Println(cli.BgRed, "downloadPath", cli.Reset, err)
	} else {
		slog.Info("successfully created download path", slog.String("path", c.DownloadPath))
	}

	// limit concurrent downloads for systems with 2 or less logical cores
	if runtime.NumCPU() <= 2 {
		c.QueueSize = 1
	}

	// if config file is found it will be merged with the current config struct
	if err := c.LoadFile(configFile); err != nil {
		log.Println(cli.BgRed, "config", cli.Reset, err)
	}

	openid.Configure()

	server.RunBlocking(&server.RunConfig{
		App:     frontend,
		Swagger: swagger,
	})
}
