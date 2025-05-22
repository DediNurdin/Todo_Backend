const supabase = require('./supabase')

// Hapus array todos dan uuid (karena sudah handle oleh Supabase)

exports.handler = async function (event) {
    // Dapatkan JWT dari header
    const token = event.headers.authorization?.split(' ')[1]

    // Verifikasi user
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)

    if (authError) {
        return {
            statusCode: 401,
            body: JSON.stringify({ error: 'Unauthorized' })
        }
    }

    const method = event.httpMethod
    const id = event.queryStringParameters?.id

    if (method === 'GET') {
        if (event.path === '/stats') {
            const { count: total } = await supabase
                .from('todos')
                .select('*', { count: 'exact' })
                .eq('user_id', user.id)

            const { count: completed } = await supabase
                .from('todos')
                .select('*', { count: 'exact' })
                .eq('user_id', user.id)
                .eq('is_completed', true)

            return {
                statusCode: 200,
                body: JSON.stringify({
                    total,
                    completed,
                    incomplete: total - completed
                })
            }
        }

        if (id) {
            const { data: todo, error } = await supabase
                .from('todos')
                .select('*')
                .eq('id', id)
                .eq('user_id', user.id)
                .single()

            if (error) {
                return {
                    statusCode: 404,
                    body: JSON.stringify({ error: 'Todo not found' })
                }
            }

            return {
                statusCode: 200,
                body: JSON.stringify(todo)
            }
        } else {
            const { data: todos, error } = await supabase
                .from('todos')
                .select('*')
                .eq('user_id', user.id)

            const stats = await getTodoStats(user.id)

            return {
                statusCode: 200,
                body: JSON.stringify({ todos, stats })
            }
        }
    }

    if (method === 'POST') {
        try {
            const data = JSON.parse(event.body)

            const newTodo = {
                title: data.title,
                description: data.description || '',
                is_completed: data.isCompleted || false,
                due_date: data.dueDate || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
                user_id: user.id
            }

            const { data: insertedTodo, error } = await supabase
                .from('todos')
                .insert([newTodo])
                .single()

            if (error) throw error

            const stats = await getTodoStats(user.id)

            return {
                statusCode: 201,
                body: JSON.stringify({
                    todo: insertedTodo,
                    stats
                })
            }
        } catch (err) {
            return {
                statusCode: 400,
                body: JSON.stringify({ error: err.message })
            }
        }
    }

    if (method === 'PUT') {
        if (!id) {
            return {
                statusCode: 400,
                body: JSON.stringify({ error: 'Missing id in query' })
            }
        }

        try {
            const data = JSON.parse(event.body)

            const updates = {
                title: data.title,
                description: data.description,
                is_completed: data.isCompleted,
                due_date: data.dueDate
            }

            const { data: updatedTodo, error } = await supabase
                .from('todos')
                .update(updates)
                .eq('id', id)
                .eq('user_id', user.id)
                .single()

            if (error) throw error

            const stats = await getTodoStats(user.id)

            return {
                statusCode: 200,
                body: JSON.stringify({
                    todo: updatedTodo,
                    stats
                })
            }
        } catch (err) {
            return {
                statusCode: 400,
                body: JSON.stringify({ error: err.message })
            }
        }
    }
    if (method === 'DELETE') {
        if (!id) {
            return {
                statusCode: 400,
                body: JSON.stringify({ error: 'Missing id in query' })
            }
        }

        try {
            // Dapatkan todo sebelum dihapus
            const { data: todoToDelete, error: fetchError } = await supabase
                .from('todos')
                .select('*')
                .eq('id', id)
                .eq('user_id', user.id)
                .single()

            if (fetchError) throw fetchError

            // Hapus todo
            const { error } = await supabase
                .from('todos')
                .delete()
                .eq('id', id)
                .eq('user_id', user.id)

            if (error) throw error

            const stats = await getTodoStats(user.id)

            return {
                statusCode: 200,
                body: JSON.stringify({
                    message: 'Todo deleted',
                    deleted: todoToDelete,
                    stats
                })
            }
        } catch (err) {
            return {
                statusCode: 404,
                body: JSON.stringify({ error: err.message })
            }
        }
    }
}

async function getTodoStats(userId) {
    const { count: total } = await supabase
        .from('todos')
        .select('*', { count: 'exact' })
        .eq('user_id', userId)

    const { count: completed } = await supabase
        .from('todos')
        .select('*', { count: 'exact' })
        .eq('user_id', userId)
        .eq('is_completed', true)

    return {
        total,
        completed,
        incomplete: total - completed
    }
}