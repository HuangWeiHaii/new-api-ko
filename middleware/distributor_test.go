package middleware

import (
	"fmt"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"

	"github.com/QuantumNous/new-api/common"
	"github.com/QuantumNous/new-api/constant"
	"github.com/QuantumNous/new-api/model"
	relayconstant "github.com/QuantumNous/new-api/relay/constant"
	"github.com/gin-gonic/gin"
	"github.com/glebarez/sqlite"
	"github.com/stretchr/testify/require"
	"gorm.io/gorm"
)

func setupDistributorTestDB(t *testing.T) *gorm.DB {
	t.Helper()

	gin.SetMode(gin.TestMode)
	common.UsingSQLite = true
	common.UsingMySQL = false
	common.UsingPostgreSQL = false
	common.RedisEnabled = false

	dsn := fmt.Sprintf("file:%s?mode=memory&cache=shared", strings.ReplaceAll(t.Name(), "/", "_"))
	db, err := gorm.Open(sqlite.Open(dsn), &gorm.Config{})
	require.NoError(t, err)
	model.DB = db
	model.LOG_DB = db

	require.NoError(t, db.AutoMigrate(&model.Task{}))

	t.Cleanup(func() {
		sqlDB, err := db.DB()
		if err == nil {
			_ = sqlDB.Close()
		}
	})

	return db
}

func TestGetModelRequestVideoFetchUsesStoredTaskModel(t *testing.T) {
	db := setupDistributorTestDB(t)
	const originModel = "bytedance/doubao-seedance-2-0-260128"

	require.NoError(t, db.Create(&model.Task{
		TaskID:    "task_local",
		UserId:    7,
		Platform:  constant.TaskPlatform("58"),
		ChannelId: 1,
		Properties: model.Properties{
			OriginModelName: originModel,
		},
	}).Error)

	recorder := httptest.NewRecorder()
	c, _ := gin.CreateTestContext(recorder)
	c.Request = httptest.NewRequest(http.MethodGet, "/v1/video/generations/task_local", nil)
	c.Params = gin.Params{{Key: "task_id", Value: "task_local"}}
	c.Set("id", 7)

	modelRequest, shouldSelectChannel, err := getModelRequest(c)

	require.NoError(t, err)
	require.False(t, shouldSelectChannel)
	require.Equal(t, originModel, modelRequest.Model)
	require.Equal(t, relayconstant.RelayModeVideoFetchByID, c.GetInt("relay_mode"))
}
