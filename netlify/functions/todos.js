const supabase = require('./supabase')


exports.handler = async function (event) {
    const token = event.headers.authorization?.split(' ')[1]
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
            const { title, description, is_completed, due_date } = JSON.parse(event.body);

            const { data, error } = await supabase
                .from('todos')
                .insert({
                    title,
                    description: description || '',
                    is_completed: is_completed || false,
                    due_date: due_date || null,
                    user_id: user.id
                })
                .select('*')
                .single();

            if (error) throw error;

            return {
                statusCode: 201,
                body: JSON.stringify({
                    todo: {
                        id: data.id,
                        user_id: data.user_id,
                        title: data.title,
                        description: data.description,
                        is_completed: data.is_completed,
                        due_date: data.due_date,
                        created_at: data.created_at
                    },
                    stats: await getStats(user.id)
                })
            };
        } catch (err) {
            return {
                statusCode: 400,
                body: JSON.stringify({ error: err.message })
            };
        }
    }

    if (method === 'PUT') {
        const id = event.queryStringParameters?.id;
        if (!id) {
            return { statusCode: 400, body: JSON.stringify({ error: 'Missing id' }) };
        }

        try {
            const updates = JSON.parse(event.body);

            const { data, error } = await supabase
                .from('todos')
                .update({
                    title: updates.title,
                    description: updates.description,
                    is_completed: updates.is_completed,
                    due_date: updates.due_date
                })
                .eq('id', id)
                .eq('user_id', user.id)
                .select('*')
                .single();

            if (error) throw error;

            return {
                statusCode: 200,
                body: JSON.stringify({
                    todo: {
                        id: data.id,
                        user_id: data.user_id,
                        title: data.title,
                        description: data.description,
                        is_completed: data.is_completed,
                        due_date: data.due_date,
                        created_at: data.created_at
                    },
                    stats: await getStats(user.id)
                })
            };
        } catch (err) {
            return {
                statusCode: 400,
                body: JSON.stringify({ error: err.message })
            };
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
            const { data: todoToDelete, error: fetchError } = await supabase
                .from('todos')
                .select('*')
                .eq('id', id)
                .eq('user_id', user.id)
                .single()

            if (fetchError) throw fetchError

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

const getStats = async (userId) => {
    const { count: total } = await supabase
        .from('todos')
        .select('*', { count: 'exact' })
        .eq('user_id', userId);

    const { count: completed } = await supabase
        .from('todos')
        .select('*', { count: 'exact' })
        .eq('user_id', userId)
        .eq('is_completed', true);

    return {
        total,
        completed,
        incomplete: total - completed
    };
};