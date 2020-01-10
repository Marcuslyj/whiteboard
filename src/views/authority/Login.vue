<template>
	<Row type="flex" justify="center" align="middle" class="mi-login">
		<Col span="8" class="mi-login-box">
			<Input prefix="ios-contact"
			       placeholder="请输入工号"
			       v-model="account"
			       size="large" />
			<Input prefix="ios-lock"
			       type="password"
			       placeholder="请输入密码"
			       size="large"
			       v-model="password"
			       @enter="login"
			       password
			       style="margin-top: 16px" />
			<Button type="primary"
			        @click="login"
			        style="width: 100%;margin-top: 16px;margin-bottom: 8px;">登录
			</Button>
			<span class="mi-login-tip" v-if="message">
				<icon type="md-alert" />{{ message }}
			</span>
		</Col>
	</Row>
</template>

<script>
	import Vue from 'vue';
	import {Row, Col, Input, Button, Icon} from 'view-design';
	const components = {Row, Col, Input, Button, Icon};
	Object.keys(components).forEach(key => {
	    Vue.component(key, components[key]);
	});
    const AuthorityLoginComponent = {
        data() {
            return {
                account: null,
	            password: null,
	            message: null
            }
        },
        methods: {
            check() {
                let status = false;
                this.message = null;
                if (!this.account) {
                    this.message = '请输入工号';
                } else if (!/[a-zA-Z]([0-9]{1,20})$/.test(this.account)) {
                    this.message = '工号格式不正确 ( 示例：A0001 )';
                } else if (!this.password) {
                    this.message = '请输入密码';
                }
                if (!this.message) status = true;
                return status;
            },
            login() {
                if (this.check()) {
                    this.$api.post('user-manager/login', {
                        account: this.account,
	                    password: this.password
                    }, (res) => {
                        if (res['ret']['retCode'] === '0') {
                            this.$router.push({name: 'meeting'});
                        } else {
                            this.message = res['ret']['retMsg'];
                        }
                    }, (err) => {
                        this.message = err.message;
                    });
                }
            }
        },
	    created() {
            if (this.getCookie('sid')) this.$router.push({name: 'meeting'});
	    }
    };
    export default AuthorityLoginComponent;
</script>

<style lang="less" scoped>
	@mi-login: mi-login;
	.@{mi-login} {
		width: 100%;
		height: 100%;
		margin: 0 auto;
		display: flex;
		align-items: center;
		justify-content: center;
		&-box {
			max-width: 400px;
			padding: 32px;
	        border: 1px solid #E4E4E4;
	        border-radius: 8px;
		}
		&-tip {
			display: flex;
			align-items: center;
			justify-content: center;
			font-size: 14px;
			color: #F56C6C;
			i {
				font-size: 18px;
				margin-right: 4px;
			}
		}
	}
</style>
