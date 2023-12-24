function Executor(tasks, params) {
    this.tasks = tasks;
    this.params = params;

    this.executeTask = (name, options) => {
        console.warn(`-----===== Start ${name} task =====-----`);

        try {
            const task = this.tasks[name] || require(`../tasks/${name}`);
            if (task) {
                tasks[name] = task;
                return task.run(this.params, options);
            } else {
                return Promise.reject(`${name} is not defined or regitered`);
            } 
        } catch (e) {
            return Promise.reject(e);
        }
    };
};

module.exports = Executor;